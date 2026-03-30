import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/db';
import Donation from '../../../../models/Donation';
import { getAuthUser } from '../../../../lib/auth';

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    await connectDB();
    const donation = await Donation.findById(resolvedParams.id)
      .populate('donor', 'name email phone avatar badges')
      .populate('acceptedBy', 'name email phone');

    if (!donation) {
      return NextResponse.json({ error: 'Donation not found' }, { status: 404 });
    }

    return NextResponse.json({ donation });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch donation' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params;
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();
    const donation = await Donation.findById(resolvedParams.id);

    if (!donation) {
      return NextResponse.json({ error: 'Donation not found' }, { status: 404 });
    }

    if (body.status === 'accepted' && (user.role === 'ngo' || user.role === 'admin')) {
      donation.status = 'accepted';
      donation.acceptedBy = user._id;
    } else if (body.status === 'picked' && (user.role === 'volunteer' || user.role === 'admin')) {
      donation.status = 'picked';
    } else if (body.status === 'delivered' && (user.role === 'volunteer' || user.role === 'admin')) {
      if (user.role === 'volunteer') {
        if (donation.deliveryOtp && donation.deliveryOtp !== body.otp) {
          return NextResponse.json({ error: 'Incorrect verification OTP' }, { status: 400 });
        }
      }
      donation.status = 'delivered';
    } else if (body.status === 'cancelled' && (donation.donor.toString() === user._id.toString() || user.role === 'admin')) {
      donation.status = 'cancelled';
    } else if (donation.donor.toString() === user._id.toString()) {
      Object.assign(donation, body);
    } else {
      return NextResponse.json({ error: 'Not authorized to update this donation' }, { status: 403 });
    }

    await donation.save();
    const updated = await Donation.findById(resolvedParams.id)
      .populate('donor', 'name email phone avatar')
      .populate('acceptedBy', 'name email phone');

    return NextResponse.json({ donation: updated });
  } catch (error) {
    console.error('Update donation error:', error);
    return NextResponse.json({ error: 'Failed to update donation' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const resolvedParams = await params;
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    await connectDB();
    const donation = await Donation.findById(resolvedParams.id);
    if (!donation) {
      return NextResponse.json({ error: 'Donation not found' }, { status: 404 });
    }

    if (donation.donor.toString() !== user._id.toString() && user.role !== 'admin') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    await Donation.findByIdAndDelete(resolvedParams.id);
    return NextResponse.json({ message: 'Donation deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete donation' }, { status: 500 });
  }
}
