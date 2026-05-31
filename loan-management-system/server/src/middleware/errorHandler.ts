import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { ApiError } from '../utils/http';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed.',
      details: err.flatten()
    });
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      details: err.details
    });
  }

  if (err?.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'Duplicate value detected.',
      details: err.keyValue
    });
  }

  console.error(err);
  return res.status(500).json({
    success: false,
    message: 'Internal server error.'
  });
};
