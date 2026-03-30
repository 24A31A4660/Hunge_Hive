import { NextResponse } from 'next/server';
import connectDB from '../../../lib/db';
import Donation from '../../../models/Donation';
import User from '../../../models/User';
import { getAuthUser } from '../../../lib/auth';
import { quantityToMeals, getBadgeForDonations } from '../../../lib/utils';

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    
    const statuses = searchParams.getAll('status');
    let category = searchParams.get('category');
    if (category === 'nonveg') category = 'non-veg';
    if (category === 'non veg') category = 'non-veg';
    const donorId = searchParams.get('donor');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radius = searchParams.get('radius') || 20;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    let query = {};
    if (statuses.length > 0) query.status = { $in: statuses };
    if (category) query.category = category;
    if (donorId) query.donor = donorId;

    if (lat && lng) {
      query['location'] = {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: parseInt(radius) * 1000,
        },
      };
    }

    const total = await Donation.countDocuments(query);
    const donations = await Donation.find(query)
      .populate('donor', 'name email phone avatar')
      .populate('acceptedBy', 'name email phone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({
      donations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Fetch donations error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch donations' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    if (user.role !== 'donor' && user.role !== 'admin') {
      return NextResponse.json({ error: 'Only donors can create donations' }, { status: 403 });
    }

    await connectDB();
    const body = await request.json();
    const { foodType, category, quantity, unit, location, pickupTime, expiryTime, cookedTime, image, notes } = body;

    if (!foodType || !category || !quantity || !location?.coordinates || !pickupTime || !expiryTime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const estimatedMeals = quantityToMeals(quantity, unit || 'plates');

    const donation = await Donation.create({
      donor: user._id,
      foodType,
      category,
      quantity,
      unit: unit || 'plates',
      estimatedMeals,
      location: {
        type: 'Point',
        coordinates: location.coordinates,
        address: location.address || '',
      },
      pickupTime: new Date(pickupTime),
      expiryTime: new Date(expiryTime),
      cookedTime: cookedTime ? new Date(cookedTime) : null,
      image: image || '',
      notes: notes || '',
    });

    await User.findByIdAndUpdate(user._id, {
      $inc: { totalDonations: 1, totalMeals: estimatedMeals },
    });

    const updatedUser = await User.findById(user._id);
    const newBadge = getBadgeForDonations(updatedUser.totalDonations);
    if (newBadge && !updatedUser.badges.includes(newBadge)) {
      await User.findByIdAndUpdate(user._id, {
        $addToSet: { badges: newBadge },
      });
    }

    const populated = await Donation.findById(donation._id)
      .populate('donor', 'name email phone avatar');

    return NextResponse.json({ donation: populated }, { status: 201 });
  } catch (error) {
    console.error('Create donation error:', error);
    return NextResponse.json(
      { error: 'Failed to create donation' },
      { status: 500 }
    );
  }
}
