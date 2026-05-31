import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { env } from '../config/env';
import { ApiError } from '../utils/http';

const salarySlipDir = path.join(env.uploadDir, 'salary-slips');
fs.mkdirSync(salarySlipDir, { recursive: true });

const allowedMimeTypes = new Set(['application/pdf', 'image/jpeg', 'image/png']);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, salarySlipDir),
  filename: (req, file, cb) => {
    const userId = req.user?.id ?? 'anonymous';
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${userId}-${Date.now()}${ext}`);
  }
});

export const uploadSalarySlip = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      return cb(new ApiError(415, 'Only PDF, JPG and PNG salary slips are allowed.'));
    }
    return cb(null, true);
  }
});
