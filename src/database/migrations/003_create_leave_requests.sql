CREATE TABLE leave_requests (
    id UUID PRIMARY KEY,

    tenant_id UUID NOT NULL,

    employee_id UUID NOT NULL REFERENCES employees(id),

    leave_type leave_type NOT NULL,

    status leave_status NOT NULL DEFAULT 'PENDING',

    start_date DATE NOT NULL,

    end_date DATE NOT NULL,

    reason TEXT,

    approved_by UUID,

    approved_at TIMESTAMP,

    rejected_comment TEXT,

    created_at TIMESTAMP DEFAULT NOW(),

    updated_at TIMESTAMP DEFAULT NOW(),

    CHECK (end_date >= start_date)
);