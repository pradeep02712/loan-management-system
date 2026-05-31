import { Router } from 'express';
import {
  approveLoan,
  disburseLoan,
  getCollectionLoans,
  getDisbursementLoans,
  getSalesLeads,
  getSanctionLoans,
  recordPayment,
  rejectLoan
} from '../controllers/dashboard.controller';
import { Roles } from '../constants/enums';
import { authenticate } from '../middleware/auth';
import { requireRoles } from '../middleware/rbac';

export const dashboardRoutes = Router();

dashboardRoutes.use(authenticate);

dashboardRoutes.get('/sales/leads', requireRoles(Roles.ADMIN, Roles.SALES), getSalesLeads);

dashboardRoutes.get('/sanction/loans', requireRoles(Roles.ADMIN, Roles.SANCTION), getSanctionLoans);
dashboardRoutes.post('/sanction/loans/:loanId/approve', requireRoles(Roles.ADMIN, Roles.SANCTION), approveLoan);
dashboardRoutes.post('/sanction/loans/:loanId/reject', requireRoles(Roles.ADMIN, Roles.SANCTION), rejectLoan);

dashboardRoutes.get('/disbursement/loans', requireRoles(Roles.ADMIN, Roles.DISBURSEMENT), getDisbursementLoans);
dashboardRoutes.post('/disbursement/loans/:loanId/disburse', requireRoles(Roles.ADMIN, Roles.DISBURSEMENT), disburseLoan);

dashboardRoutes.get('/collection/loans', requireRoles(Roles.ADMIN, Roles.COLLECTION), getCollectionLoans);
dashboardRoutes.post('/collection/loans/:loanId/payments', requireRoles(Roles.ADMIN, Roles.COLLECTION), recordPayment);
