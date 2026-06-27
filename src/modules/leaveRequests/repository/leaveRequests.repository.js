import pool from "../../../config/database.js";
import BaseRepository from "./baseRepository.js";

class LeaveRequestRepository extends BaseRepository {

    //  Find an employee by ID within a tenant
    async findEmployeeById(employeeId, tenantId) {

        // const rows = await this.query(SQL.FIND_EMPLOYEE, [
        //     employeeId, tenantId,
        // ]);

        const query = `SELECT id, full_name, annual_leave_balance
            FROM employees WHERE id = $1 AND tenant_id = $2 LIMIT 1; 
        `;

        const rows = await this.query(query, [
            employeeId,
            tenantId,
        ]);

        return rows[0] ?? null;
    }

    // Check for overlapping leave requests
    async findOverlappingLeave(
        employeeId, tenantId, startDate, endDate
    ) {

        // SELECT id
        //     FROM leave_requests WHERE employee_id = $1 AND tenant_id = $2
        //       AND status IN ('PENDING', 'APPROVED') AND start_date <= $4 AND end_date >= $3
        //     LIMIT 1;
        const query = `
            SELECT EXISTS (SELECT 1 FROM leave_requests WHERE employee_id = $1 AND tenant_id = $2
                AND status IN ('PENDING', 'APPROVED') AND start_date <= $4 AND end_date >= $3
            ) AS exists;
        `;
        
        const { rows } = await pool.query(query, [
            employeeId, tenantId, startDate, endDate,
        ]);

        // return rows[0] || null;
        return rows[0].exists;
    }


    // Create a new leave request
    async createLeaveRequest(leave) {

        const query = `
            INSERT INTO leave_requests (
                id,
                tenant_id,
                employee_id,
                leave_type,
                status,
                start_date,
                end_date,
                reason
            )
            VALUES (
                $1,$2,$3,$4,$5,$6,$7,$8
            )
            RETURNING *;
        `;

        const values = [
            leave.id,
            leave.tenantId,
            leave.employeeId,
            leave.leaveType,
            leave.status,
            leave.startDate,
            leave.endDate,
            leave.reason,
        ];

        const { rows } = await pool.query(query, values);

        return rows[0];
    }


    // Approve a leave request
    async approveLeaveRequest(
        leaveRequestId,
        approverId,
        tenantId
    ) {

        const query = `
            UPDATE leave_requests
            SET
                status = 'APPROVED',
                approved_by = $1,
                approved_at = NOW(),
                updated_at = NOW()
            WHERE
                id = $2
                AND tenant_id = $3
                AND status = 'PENDING'
            RETURNING *;
        `;

        const { rows } = await pool.query(query, [
            approverId,
            leaveRequestId,
            tenantId
        ]);

        if (!rows.length) {
            throw new Error("Leave request not found or already processed.");
        }

        return rows[0];
    }
}

export default new LeaveRequestRepository();