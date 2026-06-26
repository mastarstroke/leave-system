CREATE TYPE leave_type AS ENUM (
    'ANNUAL',
    'SICK',
    'UNPAID'
);

CREATE TYPE leave_status AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);