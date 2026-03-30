import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET() {
  await connectDB();

  return Response.json({
    status: "DB Connected ✅",
    db: mongoose.connection.name
  });
}
