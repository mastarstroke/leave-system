import BaseRepository from "../../BaseRepository.js";

class EmployeeRepository extends BaseRepository {

    async findById(employeeId, tenantId) {

        const query = `
            SELECT
                id,
                full_name,
                annual_leave_balance
            FROM employees
            WHERE id = $1
              AND tenant_id = $2
            LIMIT 1;
        `;

        const rows = await this.query(query, [
            employeeId,
            tenantId
        ]);

        return rows[0] ?? null;
    }

}

export default new EmployeeRepository();