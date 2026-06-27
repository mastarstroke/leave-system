import { Router } from "express";

import LeaveRequestController from "../controller/leaveRequest.controller.js";
import asyncHandler from "../../../utils/asyncHandler.js";

const router = Router();

// route - POST /api/v1/leave-requests
// desc -  Submit a new leave request
// access - Private
router.post(
    "/",
    asyncHandler(LeaveRequestController.submitLeaveRequest)
);

// route - POST /api/v1/leave-requests/:id/approve
// desc - Approve a leave request
// access - Manager
router.post(
    "/:id/approve",
    asyncHandler(LeaveRequestController.approveLeaveRequest)
);

// route   POST /api/v1/leave-requests/:id/reject
// desc    Reject a leave request
// access  Manager
router.post(
    "/:id/reject",
    asyncHandler(LeaveRequestController.rejectLeaveRequest)
);

//  route   GET /api/v1/leave-requests
//  desc    List leave requests
//  access  Private
router.get(
    "/",
    asyncHandler(LeaveRequestController.getLeaveRequests)
);


export default router;