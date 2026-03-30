import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/db';
import Delivery from '../../../../models/Delivery';
import Donation from '../../../../models/Donation';
import { getAuthUser } from '../../../../lib/auth';

export async function GET(request, context) {
  try {
    const resolvedParams = await context.params;
    await connectDB();
    const delivery = await Delivery.findById(resolvedParams.id)
      .populate({
        path: 'donation',
        populate: { path: 'donor', select: 'name email phone' },
      })
      .populate('volunteer', 'name email phone')
      .populate('ngo', 'name email phone');

    if (!delivery) {
      return NextResponse.json({ error: 'Delivery not found' }, { status: 404 });
    }

    return NextResponse.json({ delivery });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch delivery' }, { status: 500 });
  }
}

export async function PUT(request, context) {
  try {
    const resolvedParams = await context.params;
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();
    const delivery = await Delivery.findById(resolvedParams.id);

    if (!delivery) {
      console.log('PUT delivery not found:', resolvedParams.id);
      return NextResponse.json({ error: 'Delivery not found' }, { status: 404 });
    }

    if (delivery.volunteer.toString() !== user._id.toString() && user.role !== 'admin') {
      console.log('PUT delivery not authorized:', delivery.volunteer, user._id);
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    if (body.status === 'picked') {
      delivery.status = 'picked';
      delivery.pickedAt = new Date();
      await Donation.findByIdAndUpdate(delivery.donation, { status: 'picked' });
    } else if (body.status === 'in-transit') {
      delivery.status = 'in-transit';
    } else if (body.status === 'delivered') {
      const donationObj = await Donation.findById(delivery.donation);
      if (donationObj && donationObj.deliveryOtp && donationObj.deliveryOtp !== body.otp) {
        return NextResponse.json({ error: 'Incorrect OTP' }, { status: 400 });
      }

      delivery.status = 'delivered';
      delivery.deliveredAt = new Date();
      await Donation.findByIdAndUpdate(delivery.donation, { status: 'delivered' });
    } else if (body.status === 'cancelled') {
      delivery.status = 'cancelled';
    }

    if (body.notes) delivery.notes = body.notes;

    await delivery.save();

    const updated = await Delivery.findById(resolvedParams.id)
      .populate({
        path: 'donation',
        populate: { path: 'donor', select: 'name email phone' },
      })
      .populate('volunteer', 'name email phone');

    return NextResponse.json({ delivery: updated });
  } catch (error) {
    console.error('Update delivery error:', error);
    return NextResponse.json({ error: 'Failed to update delivery' }, { status: 500 });
  }
}
