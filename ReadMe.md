# PeopleFlow - Leave Management API

A backend REST API for managing employee leave requests in a multi-tenant HR SaaS platform.

This project was built using **Node.js**, **Express.js**, and **PostgreSQL**, following a modular architecture with clear separation of concerns.

---

# Tech Stack

- Node.js
- Express.js
- PostgreSQL
- Native `pg` package
- ES Modules

---

# Architecture

The project follows a layered architecture:

```
Route
   ↓
Controller
   ↓
Service (Business Logic)
   ↓
Repository (Database Access)
   ↓
PostgreSQL
```

Each module is self-contained.

```
src
│
├── config/
│
├── middleware/
│
├── utils/
│
├── modules/
│   │
│   ├── BaseRepository.js
│   │
│   ├── employees/
│   │     ├── controller/
│   │     ├── service/
│   │     ├── repository/
│   │     ├── routes/
│   │     └── index.js
│   │
│   └── leaveRequests/
│         ├── controller/
│         ├── service/
│         ├── repository/
│         ├── routes/
│         └── index.js
│
├── app.js
└── server.js
```

---

# Installation

Clone the repository

```bash
git clone <repository-url>
```

Install dependencies

```bash
npm install
```

---

# Environment Variables

Create a `.env` file.

Example:

```env
PORT=5000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=peopleflow
DB_USER=postgres
DB_PASSWORD=
```

---

# Database Setup

Create the PostgreSQL database.

```sql
CREATE DATABASE peopleflow;
```

Run migrations

```bash
npm run migrate
```

Seed sample data

```bash
npm run seed
```

---

# Running the Application

Development

```bash
npm run dev
```

Production

```bash
npm start
```

---

# Multi-Tenant Support

This implementation supports a single tenant per request using the request header:

```
X-Tenant-Id
```

Example:

```
X-Tenant-Id: aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
```

Every database query is scoped by `tenant_id`.

---

# API Endpoints

## Submit Leave Request

```
POST /api/v1/leave-requests
```

Request Body

```json
{
    "employeeId": "uuid",
    "leaveType": "ANNUAL",
    "startDate": "2026-07-10",
    "endDate": "2026-07-15",
    "reason": "Family vacation"
}
```

---

## Approve Leave Request

```
POST /api/v1/leave-requests/:id/approve
```

Headers

```
X-Tenant-Id
X-Approver-Id
X-Approver-Role
```

---

## Reject Leave Request

```
POST /api/v1/leave-requests/:id/reject
```

Body

```json
{
    "comment": "Insufficient supporting information."
}
```

---

## List Leave Requests

```
GET /api/v1/leave-requests
```

Optional Query Parameters

```
status
employeeId
```

Example

```
GET /api/v1/leave-requests?status=PENDING
```

---

## Get Leave Balance

```
GET /api/v1/employees/:employeeId/leave-balance
```

---

# Business Rules Implemented

- Leave requests default to `PENDING`
- End date cannot be earlier than start date
- Leave cannot be submitted entirely in the past
- Prevent overlapping pending or approved leave requests
- Sick and unpaid leave require a reason
- Sick leave longer than three consecutive days requires a detailed reason (minimum 20 characters)
- Annual leave requests cannot exceed the employee's remaining leave balance
- Only pending leave requests can be approved
- Only pending leave requests can be rejected
- Rejected requests do not deduct leave balance
- Approved annual leave deducts leave balance
- Leave requests are sorted by newest first

---

# Error Handling

Consistent JSON responses are returned.

Example

```json
{
    "success": false,
    "message": "Employee not found."
}
```

---

# Assumptions

- Tenant identification is provided through the `X-Tenant-Id` request header.
- Employees are pre-seeded into the database.
- Annual leave balance is stored on the employee record.
- Approval is limited to users with the `MANAGER` role.
- Authentication and authorization are outside the scope of this assessment.
- HR override functionality is not implemented as stated in the assessment.

---

# Scalability Considerations

- Modular feature-based architecture.
- Repository pattern separates persistence from business logic.
- Service layer encapsulates business rules.
- Parameterized SQL queries prevent SQL injection.
- Multi-tenant data isolation using `tenant_id`.
- Shared `BaseRepository` minimizes duplicated database logic.
- PostgreSQL transactions can be used for approval workflows to ensure atomic updates.

---

# Security Considerations

- Parameterized SQL queries using the native `pg` package.
- Tenant isolation through mandatory `tenant_id` filtering.
- Input validation before persistence.
- Centralized error handling middleware.
- Business rule validation performed in the service layer.

---

# Future Improvements

- JWT authentication and role-based authorization.
- HR override workflow.
- Pagination for leave request listing.
- Audit logging for approvals and rejections.
- Email and in-app notifications.
- Optimistic locking or row-level locking (`SELECT ... FOR UPDATE`) for concurrent approvals.
- API documentation using OpenAPI (Swagger).
- Automated unit and integration tests.