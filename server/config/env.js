import crypto from 'crypto';

// JWT secret: use JWT_SECRET if provided, otherwise derive a stable one from the DB URI
// so the demo deployment works with a single environment variable.
export function jwtSecret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  return crypto
    .createHash('sha256')
    .update(`learnhub:${process.env.MONGODB_URI || 'local-dev'}`)
    .digest('hex');
}

export const isProd = process.env.NODE_ENV === 'production';
