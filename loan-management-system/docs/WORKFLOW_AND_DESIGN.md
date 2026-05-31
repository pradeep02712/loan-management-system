# LMS Workflow and Design Decisions

## Collections

### users
Stores authentication and RBAC identity.

Key fields: `fullName`, `email`, `passwordHash`, `role`, `isActive`.

### applications
Stores borrower application data before loan creation.

Key fields: `borrower`, `fullName`, `pan`, `dateOfBirth`, `monthlySalary`, `employmentMode`, `brePassed`, `breFailures`, `salarySlip`, `status`.

### loans
Stores the financial loan request and lifecycle status.

Key fields: `borrower`, `application`, `amount`, `tenureDays`, `interestRate`, `interestAmount`, `totalRepayment`, `totalPaid`, `status`, audit fields.

### payments
Stores collection payments.

Key fields: `loan`, `borrower`, `utrNumber`, `amount`, `paidAt`, `recordedBy`.

The `utrNumber` has a unique index to prevent duplicate payment references.

## Status Transitions

| From | To | Actor |
|---|---|---|
| No loan | `APPLIED` | Borrower |
| `APPLIED` | `SANCTIONED` | Admin / Sanction |
| `APPLIED` | `REJECTED` | Admin / Sanction |
| `SANCTIONED` | `DISBURSED` | Admin / Disbursement |
| `DISBURSED` | `CLOSED` | System after full payment |

## Authorization Rules

- Borrower routes require `borrower` role.
- Sales module requires `admin` or `sales`.
- Sanction module requires `admin` or `sanction`.
- Disbursement module requires `admin` or `disbursement`.
- Collection module requires `admin` or `collection`.
- Frontend hides modules based on role, but backend remains the source of truth.

## HTTP Status Choices

- `401`: missing/invalid token.
- `403`: authenticated user lacks permission.
- `409`: duplicate or invalid state transition.
- `415`: unsupported upload media type.
- `422`: validation/BRE/payment rule failure.

## Collection Validations

- UTR must be unique.
- Payment amount must be positive.
- Payment amount cannot exceed outstanding balance.
- Payment can be recorded only when loan status is `DISBURSED`.
- When `totalPaid >= totalRepayment`, the system sets `status = CLOSED` and `closedAt`.

## Interest Formula

Simple interest:

```text
SI = (P * R * T) / (365 * 100)
Total Repayment = P + SI
```

Where `T` is tenure in days and `R = 12`.
