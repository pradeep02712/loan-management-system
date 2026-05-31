# REST API Contract

Base URL: `/api`

Every successful response:

```json
{ "success": true, "data": {} }
```

Every error response:

```json
{ "success": false, "message": "Reason", "details": {} }
```

## Auth

### `POST /auth/register`

Registers a borrower only.

Request:

```json
{ "fullName": "Demo Borrower", "email": "demo@example.com", "password": "Password@123" }
```

### `POST /auth/login`

Request:

```json
{ "email": "admin@lms.dev", "password": "Password@123" }
```

### `GET /auth/me`

Requires Bearer token.

## Borrower

### `GET /borrower/application`

Returns current application, latest loan and payments.

### `POST /borrower/application/personal`

Request:

```json
{
  "fullName": "Borrower Name",
  "pan": "ABCDE1234F",
  "dateOfBirth": "1995-05-15",
  "monthlySalary": 50000,
  "employmentMode": "salaried"
}
```

### `POST /borrower/application/salary-slip`

`multipart/form-data` with field name `salarySlip`.

### `POST /borrower/loans/apply`

Request:

```json
{ "amount": 100000, "tenureDays": 180 }
```

## Dashboard

### Sales

`GET /dashboard/sales/leads`

### Sanction

`GET /dashboard/sanction/loans`

`POST /dashboard/sanction/loans/:loanId/approve`

`POST /dashboard/sanction/loans/:loanId/reject`

```json
{ "reason": "PAN details mismatch" }
```

### Disbursement

`GET /dashboard/disbursement/loans`

`POST /dashboard/disbursement/loans/:loanId/disburse`

### Collection

`GET /dashboard/collection/loans`

`POST /dashboard/collection/loans/:loanId/payments`

```json
{ "utrNumber": "UTR123456789", "amount": 25000, "paidAt": "2026-05-29" }
```
