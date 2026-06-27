import LeaveRequestService from "../service/leaveRequest.service.js";


class LeaveRequestController {

    async submitLeaveRequest(req, res) {

        const result = await LeaveRequestService.submitLeaveRequest(
            req.body,
            req.tenantId
        );

        return res.status(201).json({
            success: true,
            message: result.message,
            data: result.data,
        });

    }

    // Approve Leave Request
    async approveLeaveRequest(req, res) {
        const { id } = req.params;

        const approverId = req.header("X-Approver-Id");
        const approverRole = req.header("X-Approver-Role");

        const result = await LeaveRequestService.approveLeaveRequest(
            req.params.id,
            approverId,
            approverRole,
            req.tenantId
        );

        return res.status(200).json(result);
    }
    

    // Reject Leave Request
    async rejectLeaveRequest(req, res) {
        const { id } = req.params;
        const { comment } = req.body;

        const result = await LeaveRequestService.rejectLeaveRequest(
            id,
            comment,
            req.tenantId
        );

        return res.status(200).json({
            success: true,
            message: "Leave request rejected successfully.",
            data: result
        });
    }

}

export default new LeaveRequestController();