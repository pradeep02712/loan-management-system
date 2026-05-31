import { Router } from 'express';
import { authRoutes } from './auth.routes';
import { borrowerRoutes } from './borrower.routes';
import { dashboardRoutes } from './dashboard.routes';

export const apiRoutes = Router();

apiRoutes.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', service: 'loan-management-system-api' } });
});

apiRoutes.use('/auth', authRoutes);
apiRoutes.use('/borrower', borrowerRoutes);
apiRoutes.use('/dashboard', dashboardRoutes);
