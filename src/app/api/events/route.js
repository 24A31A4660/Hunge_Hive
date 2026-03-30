import { NextResponse } from 'next/server';
import connectDB from '../../../lib/db';
import Event from '../../../models/Event';
import { getAuthUser } from '../../../lib/auth';

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query = {};
    if (status) query.status = status;

    const events = await Event.find(query)
      .populate('organizer', 'name email')
      .populate('registeredNGOs', 'name email')
      .sort({ date: 1 });

    return NextResponse.json({ events });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
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
    const { eventName, location, date, estimatedFood, unit, description } = body;

    if (!eventName || !date || !estimatedFood) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const event = await Event.create({
      eventName,
      organizer: user._id,
      location: location || {},
      date: new Date(date),
      estimatedFood,
      unit: unit || 'plates',
      description: description || '',
    });

    const populated = await Event.findById(event._id)
      .populate('organizer', 'name email');

    return NextResponse.json({ event: populated }, { status: 201 });
  } catch (error) {
    console.error('Create event error:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();
    const { eventId } = body;

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID required' }, { status: 400 });
    }

    if (user.role !== 'ngo') {
      return NextResponse.json({ error: 'Only NGOs can register for events' }, { status: 403 });
    }

    await Event.findByIdAndUpdate(eventId, {
      $addToSet: { registeredNGOs: user._id },
    });

    return NextResponse.json({ message: 'Registered successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to register for event' }, { status: 500 });
  }
}
