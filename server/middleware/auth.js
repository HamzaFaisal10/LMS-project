import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { jwtSecret } from '../config/env.js';
import { ApiError, asyncHandler } from '../utils/asyncHandler.js';

export const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, jwtSecret(), { expiresIn: '7d' });

async function userFromRequest(req) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return null;
  try {
    const { id } = jwt.verify(token, jwtSecret());
    return await User.findById(id);
  } catch {
    return null;
  }
}

// Requires a valid, non-blocked user.
export const protect = asyncHandler(async (req, _res, next) => {
  const user = await userFromRequest(req);
  if (!user) throw new ApiError(401, 'Please log in to continue');
  if (user.isBlocked) throw new ApiError(403, 'Your account has been suspended');
  req.user = user;
  next();
});

// Attaches req.user when a token is present, but never blocks the request.
export const optionalAuth = asyncHandler(async (req, _res, next) => {
  const user = await userFromRequest(req);
  if (user && !user.isBlocked) req.user = user;
  next();
});

// Role-based access control.
export const authorize =
  (...roles) =>
  (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, 'You do not have permission to do that'));
    }
    next();
  };
