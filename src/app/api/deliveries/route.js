import { NextResponse } from 'next/server';
import connectDB from '../../../lib/db';
import Delivery from '../../../models/Delivery';
import Donation from '../../../models/Donation';
import { getAuthUser } from '../../../lib/auth';

export async function GET(request) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query = {};
    if (user.role === 'volunteer') {
      query.volunteer = user._id;
    }
    if (status) query.status = status;

    const deliveries = await Delivery.find(query)
      .populate({
        path: 'donation',
        populate: { path: 'donor', select: 'name email phone' },
      })
      .populate('volunteer', 'name email phone')
      .populate('ngo', 'name email phone')
      .sort({ createdAt: -1 });

    return NextResponse.json({ deliveries });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch deliveries' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();
    const { donationId } = body;

    if (!donationId) {
      return NextResponse.json({ error: 'Donation ID is required' }, { status: 400 });
    }

    const donation = await Donation.findById(donationId);
    if (!donation) {
      return NextResponse.json({ error: 'Donation not found' }, { status: 404 });
    }

    const existingDelivery = await Delivery.findOne({ donation: donationId, status: { $ne: 'cancelled' } });
    if (existingDelivery) {
      return NextResponse.json({ error: 'Delivery already assigned for this donation' }, { status: 409 });
    }

    const deliveryOtp = Math.floor(100000 + Math.random() * 900000).toString();
    donation.deliveryOtp = deliveryOtp;
    await donation.save();

    const delivery = await Delivery.create({
      donation: donationId,
      volunteer: user._id,
      ngo: donation.acceptedBy || null,
      pickupLocation: donation.location,
      status: 'assigned',
    });

    const populated = await Delivery.findById(delivery._id)
      .populate({
        path: 'donation',
        populate: { path: 'donor', select: 'name email phone' },
      })
      .populate('volunteer', 'name email phone');

    return NextResponse.json({ delivery: populated }, { status: 201 });
  } catch (error) {
    console.error('Create delivery error:', error);
    return NextResponse.json({ error: 'Failed to create delivery' }, { status: 500 });
  }
}
