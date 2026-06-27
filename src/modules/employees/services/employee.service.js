import EmployeeRepository from "../repository/employee.repository.js";

class EmployeeService {

    constructor() {
        this.employeeRepository = EmployeeRepository;
    }

    async getLeaveBalance(employeeId, tenantId) {

        const employee = await this.employeeRepository.findById(
            employeeId,
            tenantId
        );

        if (!employee) {
            throw new Error("Employee not found.");
        }

        return {
            employeeId: employee.id,
            annualLeaveBalance: employee.annual_leave_balance
        };
    }

}

export default new EmployeeService();