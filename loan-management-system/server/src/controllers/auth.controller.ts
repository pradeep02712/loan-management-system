import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { Roles } from '../constants/enums';
import { User } from '../models/User';
import { registerSchema, loginSchema } from '../validation/auth.validation';
import { ApiError, asyncHandler, ok } from '../utils/http';

function signToken(user: { id: string; role: string }) {
  return jwt.sign({ sub: user.id, role: user.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn
  });
}

export const register = asyncHandler(async (req, res) => {
  const input = registerSchema.parse(req.body);
  const existing = await User.findOne({ email: input.email });

  if (existing) {
    throw new ApiError(409, 'Email is already registered.');
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await User.create({
    fullName: input.fullName,
    email: input.email,
    passwordHash,
    role: Roles.BORROWER
  });

  const token = signToken({ id: user.id, role: user.role });
  ok(res, { token, user }, 201);
});

export const login = asyncHandler(async (req, res) => {
  const input = loginSchema.parse(req.body);
  const user = await User.findOne({ email: input.email }).select('+passwordHash');

  if (!user || !(await user.comparePassword(input.password))) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  const token = signToken({ id: user.id, role: user.role });
  ok(res, { token, user });
});

export const me = asyncHandler(async (req, res) => {
  ok(res, { user: req.user });
});
