CREATE TABLE employees (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    annual_leave_balance INT NOT NULL DEFAULT 20 CHECK (annual_leave_balance >= 0),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);