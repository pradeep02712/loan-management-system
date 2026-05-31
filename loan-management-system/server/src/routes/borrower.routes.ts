import { Router } from 'express';
import { applyForLoan, getBorrowerApplication, savePersonalDetails, uploadSalarySlip as uploadSlipController } from '../controllers/borrower.controller';
import { Roles } from '../constants/enums';
import { authenticate } from '../middleware/auth';
import { requireRoles } from '../middleware/rbac';
import { uploadSalarySlip } from '../middleware/upload';

export const borrowerRoutes = Router();

borrowerRoutes.use(authenticate, requireRoles(Roles.BORROWER));
borrowerRoutes.get('/application', getBorrowerApplication);
borrowerRoutes.post('/application/personal', savePersonalDetails);
borrowerRoutes.post('/application/salary-slip', uploadSalarySlip.single('salarySlip'), uploadSlipController);
borrowerRoutes.post('/loans/apply', applyForLoan);
