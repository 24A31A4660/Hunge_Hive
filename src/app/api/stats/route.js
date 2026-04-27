export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import connectDB from '../../../lib/db';
import Donation from '../../../models/Donation';
import Delivery from '../../../models/Delivery';
import User from '../../../models/User';
import Event from '../../../models/Event';

export async function GET(request) {
  try {
    await connectDB();

    const [
      totalDonations,
      pendingDonations,
      deliveredDonations,
      totalUsers,
      totalDonors,
      totalNGOs,
      totalVolunteers,
      totalEvents,
      totalDeliveries,
    ] = await Promise.all([
      Donation.countDocuments(),
      Donation.countDocuments({ status: 'pending' }),
      Donation.countDocuments({ status: 'delivered' }),
      User.countDocuments(),
      User.countDocuments({ role: 'donor' }),
      User.countDocuments({ role: 'ngo' }),
      User.countDocuments({ role: 'volunteer' }),
      Event.countDocuments(),
      Delivery.countDocuments({ status: 'delivered' }),
    ]);

    const totalMeals = await Donation.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$estimatedMeals' } } },
    ]);

    const monthlyDonations = await Donation.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
          meals: { $sum: '$estimatedMeals' },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 },
    ]);

    const topDonors = await User.find({ role: 'donor' })
      .select('name totalDonations totalMeals badges avatar')
      .sort({ totalDonations: -1 })
      .limit(10);

    return NextResponse.json({
      stats: {
        totalDonations,
        pendingDonations,
        deliveredDonations,
        totalUsers,
        totalDonors,
        totalNGOs,
        totalVolunteers,
        totalEvents,
        totalDeliveries,
        totalMeals: totalMeals[0]?.total || 0,
      },
      monthlyDonations: monthlyDonations.reverse(),
      topDonors,
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
