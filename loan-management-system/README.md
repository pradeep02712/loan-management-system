# Loan Management System (LMS)

A full-stack Loan Management System built for the MERN/Next.js assignment workflow. The system contains a borrower loan application portal and an internal operations dashboard with role-based access control.

## Live Links

Working Video:
[_LINK_](https://drive.google.com/file/d/1Wqnj3VRALAA_Y-2mOFFHvoMrrOkaV3q-/view?usp=drivesdk)

Deployed Link :  
https://striking-wisdom-production-cf16.up.railway.app

Backend API:  
https://loan-management-system-production-857b.up.railway.app/api

GitHub Repository:  
https://github.com/pradeep02712/loan-management-system


## Login Credentials

All seeded users use the same password:

```text
Password@123
```

| Role | Email | Password |
|---|---|---|
| Admin | admin@lms.dev | Password@123 |
| Sales | sales@lms.dev | Password@123 |
| Sanction | sanction@lms.dev | Password@123 |
| Disbursement | disbursement@lms.dev | Password@123 |
| Collection | collection@lms.dev | Password@123 |
| Borrower | borrower@lms.dev | Password@123 |

## Tech Stack

- **Frontend:** Next.js App Router, TypeScript, Tailwind CSS
- **Backend:** Node.js, Express.js, TypeScript
- **Database:** MongoDB, Mongoose
- **Authentication:** JWT, bcrypt
- **File Upload:** Multer with PDF/JPG/PNG validation
- **Deployment:** Railway

## Features

### Borrower Portal

- Borrower registration and login
- Protected borrower application flow
- Personal details form
- Server-side Business Rule Engine (BRE)
- Salary slip upload with file validation
- Loan amount and tenure selection
- Live simple-interest repayment calculation
- Loan creation after successful application

### Operations Dashboard

- Admin dashboard with access to all modules
- Sales module for registered borrowers/leads
- Sanction module for applied loans
- Disbursement module for sanctioned loans
- Collection module for active disbursed loans
- Payment recording with unique UTR validation
- Auto-close loan when total paid equals total repayment

### Security and Access Control

- Password hashing using bcrypt
- JWT-based authentication
- Backend API authorization middleware
- Frontend protected routes
- Role-based access control for Admin, Sales, Sanction, Disbursement, Collection, and Borrower
- Borrowers cannot access operations dashboard
- Executive roles can access only their assigned module

## Project Structure

```text
loan-management-system/
├── client/                 # Next.js frontend
│   ├── app/                # App Router pages
│   ├── components/         # Shared UI components
│   ├── lib/                # API helpers, auth context, utilities
│   └── .env.example
├── server/                 # Express backend
│   ├── src/
│   │   ├── config/         # Environment and DB config
│   │   ├── constants/      # Enums and status constants
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Auth, RBAC, upload, errors
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # REST API routes
│   │   ├── seed/           # Seed users script
│   │   ├── services/       # BRE and business logic
│   │   └── validation/     # Zod validations
│   └── .env.example
├── docs/                   # Workflow and API documentation
├── docker-compose.yml      # Optional MongoDB container
├── package.json            # Root scripts
└── README.md
```


## Testing Workflow

### Borrower workflow

1. Open `http://localhost:3000` or the live app URL.
2. Login with `borrower@lms.dev` and password `Password@123`.
3. Fill personal details.
4. Run BRE eligibility check.
5. Upload salary slip as PDF/JPG/PNG under 5 MB.
6. Select loan amount and tenure.
7. Review repayment calculation.
8. Submit loan application.

### BRE fail test data

Use this data to verify rejection:

```text
Full Name: Test Fail User
PAN: ABC123
Date of Birth: 2007-01-01
Monthly Salary: 20000
Employment Mode: Unemployed
```

Expected result: application should be blocked with validation/BRE errors.

### BRE pass test data

Use this data to apply successfully:

```text
Full Name: Raman Singh
PAN: ABCDE1234F
Date of Birth: 1996-08-15
Monthly Salary: 50000
Employment Mode: Salaried
```

Example loan configuration:

```text
Loan Amount: 100000
Tenure: 180 days
```

### Admin/executive workflow

1. Login with `admin@lms.dev` to access all dashboard modules.
2. Login with role-specific accounts to test restricted module access.
3. Move a loan through the lifecycle:
   - Applied → Sanctioned or Rejected
   - Sanctioned → Disbursed
   - Disbursed → Closed after full repayment

Example payment for a ₹1,00,000 loan with 180 days tenure:

```text
UTR Number: UTRRAMAN001
Amount: 105917.81
Date: Today's date
```

Use a new unique UTR for every new payment.

## Loan Rules

### BRE eligibility rules

The server rejects the borrower if any rule fails:

- Age must be between 23 and 50
- Monthly salary must be at least ₹25,000
- PAN must match valid PAN format
- Employment mode must not be Unemployed

Valid PAN format example:

```text
ABCDE1234F
```

### Loan configuration

- Loan amount range: ₹50,000 to ₹5,00,000
- Tenure range: 30 to 365 days
- Interest rate: 12% per annum
- Interest type: Simple Interest

Formula:

```text
SI = (P × R × T) / (365 × 100)
Total Repayment = P + SI
```

## Role-Based Access

| Role | Access |
|---|---|
| Admin | All dashboard modules |
| Sales | Sales module only |
| Sanction | Sanction module only |
| Disbursement | Disbursement module only |
| Collection | Collection module only |
| Borrower | Borrower portal only |



Working Video:
[_LINK_](https://drive.google.com/file/d/1Wqnj3VRALAA_Y-2mOFFHvoMrrOkaV3q-/view?usp=drivesdk)

Login Credentials:
Admin - admin@lms.dev / Password@123
Sales - sales@lms.dev / Password@123
Sanction - sanction@lms.dev / Password@123
Disbursement - disbursement@lms.dev / Password@123
Collection - collection@lms.dev / Password@123
Borrower - borrower@lms.dev / Password@123
```

