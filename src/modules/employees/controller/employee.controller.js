import EmployeeService from "../services/employee.service.js";

class EmployeeController {

    async getLeaveBalance(req, res) {

        const { employeeId } = req.params;

        const result = await EmployeeService.getLeaveBalance(
            employeeId,
            req.tenantId
        );

        return res.status(200).json({
            success: true,
            data: result
        });
    }

}

export default new EmployeeController();