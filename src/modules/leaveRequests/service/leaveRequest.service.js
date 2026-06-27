import { v4 as uuidv4 } from "uuid";
import LeaveRequestRepository from "../repository/leaveRequests.repository.js";
import ApiError from "../../../utils/ApiError.js";

class LeaveRequestService {
    constructor() {
        this.leaveRequestRepository = LeaveRequestRepository;
    }

    //  Submit Leave Request
    async submitLeaveRequest(data, tenantId) {
        const {
            employeeId,
            leaveType,
            startDate,
            endDate,
            reason,
        } = data;

        //   Validate Employee Exists
        const employee = await this.leaveRequestRepository.findEmployeeById(
            employeeId, tenantId
        );

        if (!employee) {
            throw new ApiError(404, "Employee not found.");
        }

        //  Validate Dates
        const start = new Date(startDate);
        const end = new Date(endDate);

        // Remove time portion
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (end < start) {
            throw new ApiError(400, "End date must be on or after start date.");
        }

        // Leave entirely in the past
        if (end < today) {
            throw new ApiError(400, "Leave cannot be submitted entirely in the past.");
        }

        //  Calculate requested days
        const millisecondsPerDay = 1000 * 60 * 60 * 24;

        const requestedDays =
            Math.floor((end - start) / millisecondsPerDay) + 1;

        //  Reason Validation
        if (
            (leaveType === "SICK" || leaveType === "UNPAID") &&
            (!reason || reason.trim() === "")
        ) {
            throw new ApiError(400, "Reason is required for Sick and Unpaid leave.");
        }

        if (
            leaveType === "SICK" &&
            requestedDays > 3 &&
            reason.trim().length < 20
        ) {
            throw new ApiError(
                400, "Sick leave exceeding 3 consecutive days requires a reason of at least 20 characters."
            );
        }

        //  Annual Leave Balance
        if (leaveType === "ANNUAL") {
            if (requestedDays > employee.annual_leave_balance) {
                throw new ApiError(400, "Insufficient annual leave balance.");
            }
        }


        //  Check overlapping leave
        const overlap =
            await this.leaveRequestRepository.findOverlappingLeave(
                employeeId,
                tenantId,
                startDate,
                endDate
            );

        if (overlap) {
            throw new ApiError(409, "Employee already has an overlapping leave request.");
        }


        //  Create Leave Request
        const leave = {
            id: uuidv4(),
            tenantId,
            employeeId,
            leaveType,
            startDate,
            endDate,
            reason: reason ?? null,
            status: "PENDING",
        };

        const createdLeave = await this.leaveRequestRepository.createLeaveRequest(leave);

        //  Return Response
        return {
            message: "Leave request submitted successfully.",
            data: createdLeave,
        };
    }


    // approve Leave Request
    async approveLeaveRequest(
        leaveRequestId,
        approverId,
        approverRole,
        tenantId
    ) {
        // Manager role validation
        if (!approverRole) {
            throw new Error("Approver role is required.");
        }

        if (approverRole !== "MANAGER") {
            throw new Error("Only MANAGER can approve leave requests.");
        }

        return await this.leaveRequestRepository.approveLeaveRequest(
            leaveRequestId,
            approverId,
            tenantId
        );
    }

    // reject Leave Request
    async rejectLeaveRequest(
        leaveRequestId,
        comment,
        tenantId
    ) {

        if (!comment || !comment.trim()) {
            throw new Error("Rejection comment is required.");
        }

        const leaveRequest =
            await this.leaveRequestRepository.findById(
                leaveRequestId,
                tenantId
            );

        if (!leaveRequest) {
            throw new Error("Leave request not found.");
        }

        if (leaveRequest.status !== "PENDING") {
            throw new Error(
                `Cannot reject a ${leaveRequest.status.toLowerCase()} leave request.`
            );
        }

        return await this.leaveRequestRepository.rejectLeaveRequest(
            leaveRequestId,
            comment,
            tenantId
        );
    }
}

export default new LeaveRequestService();