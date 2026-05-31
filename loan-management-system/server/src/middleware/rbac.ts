import type { Role } from '../constants/enums';
import { ApiError } from '../utils/http';
import type { NextFunction, Request, Response } from 'express';

export function requireRoles(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required.'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ApiError(403, 'You do not have permission to perform this action.'));
    }

    return next();
  };
}
