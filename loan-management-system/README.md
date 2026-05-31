# Loan Management System (LMS)

A full-stack Loan Management System built for the MERN/Next.js assignment workflow. The system contains a borrower loan application portal and an internal operations dashboard with role-based access control.

## Tech Stack

- **Frontend:** Next.js App Router, TypeScript, Tailwind CSS
- **Backend:** Node.js, Express.js, TypeScript
- **Database:** MongoDB, Mongoose
- **Authentication:** JWT, bcrypt
- **File Upload:** Multer with PDF/JPG/PNG validation

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

## Environment Setup

### Server environment

Create `server/.env` from the example file:

```cmd
copy server\.env.example server\.env
```

Default server values:

```env
NODE_ENV=development
PORT=4000
MONGO_URI=mongodb://localhost:27017/lms
JWT_SECRET=replace-with-a-long-random-secret-for-local-development
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
UPLOAD_DIR=uploads
```

### Client environment

Create `client/.env.local` from the example file:

```cmd
copy client\.env.example client\.env.local
```

Default client value:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

## Installation

Open CMD in the project root:

```cmd
cd /d C:\Users\sande\OneDrive\Desktop\loan-management-system
```

Install root dependencies:

```cmd
npm install
```

Install backend dependencies:

```cmd
npm --prefix server install
```

Install frontend dependencies:

```cmd
npm --prefix client install
```

## Start MongoDB

### Option A: Using local MongoDB service

Start MongoDB service from CMD as Administrator:

```cmd
net start MongoDB
```

If MongoDB is already running, you can ignore the message.

### Option B: Using Docker

If Docker Desktop is installed and running:

```cmd
docker compose up -d
```

## Seed Demo Users

Run this from the project root:

```cmd
npm run seed
```

This creates one account for each role.

| Role | Email | Password |
|---|---|---|
| Admin | admin@lms.dev | Password@123 |
| Sales | sales@lms.dev | Password@123 |
| Sanction | sanction@lms.dev | Password@123 |
| Disbursement | disbursement@lms.dev | Password@123 |
| Collection | collection@lms.dev | Password@123 |
| Borrower | borrower@lms.dev | Password@123 |

## Run the Application

Run both frontend and backend together:

```cmd
npm run dev
```

Open the app:

```text
http://localhost:3000
```

Backend API:

```text
http://localhost:4000/api
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

1. Open `http://localhost:3000`
2. Login with `borrower@lms.dev`
3. Fill personal details
4. Pass BRE eligibility check
5. Upload salary slip as PDF/JPG/PNG under 5 MB
6. Select loan amount and tenure
7. Review repayment calculation
8. Submit loan application

### Admin/executive workflow

1. Login with `admin@lms.dev` to access all dashboard modules
2. Login with role-specific accounts to test restricted module access
3. Move a loan through the lifecycle:
   - Applied → Sanctioned or Rejected
   - Sanctioned → Disbursed
   - Disbursed → Closed after full repayment

## Loan Rules

### BRE eligibility rules

The server rejects the borrower if any rule fails:

- Age must be between 23 and 50
- Monthly salary must be at least ₹25,000
- PAN must match valid PAN format
- Employment mode must not be Unemployed

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

### Login says user not found

Run the seed command again:

```cmd
npm run seed
```

### Port already in use

Stop the old terminal using `Ctrl + C`, or change the backend port in `server/.env` and update `client/.env.local`.

## Submission Notes

Submit the full project folder with these files included:

```text
client/
server/
docs/
README.md
.env.example
server/.env.example
client/.env.example
docker-compose.yml
package.json
```

Do not submit local runtime files such as `node_modules`, uploaded salary slips, or real `.env` secrets.
