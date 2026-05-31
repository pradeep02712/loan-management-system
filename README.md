# Loan Management System (LMS)

A full-stack Loan Management System built for the MERN/Next.js assignment workflow. The system contains a borrower loan application portal and an internal operations dashboard with role-based access control.

## Live Links

Frontend Live App:  
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

> Note: If you clone this GitHub repository and see another `loan-management-system` folder inside the repo, go inside that inner folder before running commands.

## Prerequisites

Install these before running the project:

- Node.js 18 or later
- npm
- MongoDB local server or Docker Desktop
- VS Code or any code editor

Check installation:

```cmd
node -v
npm -v
```

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/pradeep02712/loan-management-system.git
cd loan-management-system/loan-management-system
```

If your project files are directly inside the cloned folder, use:

```bash
cd loan-management-system
```

### 2. Install dependencies

```bash
npm install
npm --prefix server install
npm --prefix client install
```

### 3. Create environment files

For Git Bash or Linux/macOS:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env.local
```

For Windows CMD:

```cmd
copy server\.env.example server\.env
copy client\.env.example client\.env.local
```

### 4. Start MongoDB locally

Make sure MongoDB is running on:

```text
mongodb://localhost:27017/lms
```

Using local MongoDB service from CMD as Administrator:

```cmd
net start MongoDB
```

Using Docker Desktop:

```cmd
docker compose up -d
```

### 5. Seed demo users

```bash
npm run seed
```

### 6. Run the project

```bash
npm run dev
```

Frontend runs on:

```text
http://localhost:3000
```

Backend API runs on:

```text
http://localhost:4000/api
```

## Environment Variables

### Backend: `server/.env.example`

```env
NODE_ENV=development
PORT=4000
MONGO_URI=mongodb://localhost:27017/lms
JWT_SECRET=replace-with-a-long-random-secret-for-local-development
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
UPLOAD_DIR=uploads
```

### Frontend: `client/.env.example`

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

## Run Frontend and Backend Separately

Use this if `npm run dev` does not start both apps correctly.

### CMD Window 1: Backend

```cmd
cd /d C:\Users\sande\OneDrive\Desktop\loan-management-system\server
npm run dev
```

### CMD Window 2: Frontend

```cmd
cd /d C:\Users\sande\OneDrive\Desktop\loan-management-system\client
npm run dev
```

Open:

```text
http://localhost:3000
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

## Deployment

The project is deployed on Railway.

### Railway services

- MongoDB database service
- Backend service: `loan-management-system`
- Frontend service: `striking-wisdom`

### Backend Railway variables

```env
NODE_ENV=production
MONGO_URI=${{MongoDB.MONGO_URL}}
JWT_SECRET=loan-management-secret-key-123456789
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://striking-wisdom-production-cf16.up.railway.app
UPLOAD_DIR=uploads
```

### Frontend Railway variables

```env
PORT=3000
NEXT_PUBLIC_API_URL=https://loan-management-system-production-857b.up.railway.app/api
```

### Railway build settings

Backend service:

```text
Root Directory: loan-management-system/server
Build Command: npm install && npm run build
Start Command: npm start
```

Frontend service:

```text
Root Directory: loan-management-system/client
Build Command: npm install && npm run build
Start Command: npx next start -H 0.0.0.0 -p 3000
```

## Common Commands

```cmd
npm run dev       # Start frontend and backend
npm run seed      # Create demo users
npm run build     # Build server and client
npm run lint      # Run frontend lint
```

## Troubleshooting

### npm is not recognized

Install Node.js LTS and reopen CMD:

```cmd
winget install OpenJS.NodeJS.LTS
```

Check again:

```cmd
node -v
npm -v
```

### docker is not recognized

Either install Docker Desktop or use local MongoDB.

Install Docker Desktop:

```cmd
winget install -e --id Docker.DockerDesktop
```

### MongoDB connection error

Make sure MongoDB is running:

```cmd
net start MongoDB
```

Also check `server/.env`:

```env
MONGO_URI=mongodb://localhost:27017/lms
```

### Login says user not found locally

Run the seed command again:

```cmd
npm run seed
```

### Login says invalid credentials on deployed app

Seed users on the Railway backend database. The deployed database is separate from local MongoDB.

### Port already in use

Stop the old terminal using `Ctrl + C`, or change the backend port in `server/.env` and update `client/.env.local`.

## Submission Notes

Submit these items:

```text
GitHub Repo:
https://github.com/pradeep02712/loan-management-system

Live App:
https://striking-wisdom-production-cf16.up.railway.app

Backend API:
https://loan-management-system-production-857b.up.railway.app/api

Working Video:
PASTE_YOUR_VIDEO_LINK_HERE

Login Credentials:
Admin - admin@lms.dev / Password@123
Sales - sales@lms.dev / Password@123
Sanction - sanction@lms.dev / Password@123
Disbursement - disbursement@lms.dev / Password@123
Collection - collection@lms.dev / Password@123
Borrower - borrower@lms.dev / Password@123
```

Do not submit local runtime files such as `node_modules`, uploaded salary slips, or real `.env` secrets.
