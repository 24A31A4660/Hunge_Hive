import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import connectDB from './db';
import User from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'hungerhive-dev-jwt-secret-key-2024';

export async function hashPassword(password) {
  return bcryptjs.hash(password, 12);
}

export async function comparePassword(password, hashedPassword) {
  return bcryptjs.compare(password, hashedPassword);
}

export function generateToken(userId, role) {
  return jwt.sign(
    { userId, role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export async function getAuthUser(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) return null;

    await connectDB();
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) return null;

    return user;
  } catch {
    return null;
  }
}

export function requireAuth(handler) {
  return async (request, context) => {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    request.user = user;
    return handler(request, context);
  };
}

export function requireRole(...roles) {
  return (handler) => {
    return async (request, context) => {
      const user = await getAuthUser(request);
      if (!user) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
      if (!roles.includes(user.role)) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        );
      }
      request.user = user;
      return handler(request, context);
    };
  };
}
