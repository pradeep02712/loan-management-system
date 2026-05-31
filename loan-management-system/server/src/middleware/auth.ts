import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { User } from '../models/User';
import { ApiError, asyncHandler } from '../utils/http';

export type JwtPayload = {
  sub: string;
  role: string;
};

export const authenticate = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;

  if (!token) {
    throw new ApiError(401, 'Authentication required.');
  }

  let payload: JwtPayload;
  try {
    payload = jwt.verify(token, env.jwtSecret) as JwtPayload;
  } catch {
    throw new ApiError(401, 'Invalid or expired token.');
  }

  const user = await User.findById(payload.sub);
  if (!user || !user.isActive) {
    throw new ApiError(401, 'User is not active or does not exist.');
  }

  req.user = user;
  next();
});
