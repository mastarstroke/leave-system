import { Router } from "express";

import LeaveRequestController from "../controller/leaveRequest.controller.js";
import asyncHandler from "../../../utils/asyncHandler.js";

const router = Router();

// Submit a new leave request
router.post("/", asyncHandler(LeaveRequestController.submitLeaveRequest));

// Approve a leave request
router.post("/:id/approve", asyncHandler(LeaveRequestController.approveLeaveRequest));

// Reject a leave request
router.post("/:id/reject", asyncHandler(LeaveRequestController.rejectLeaveRequest));

// List leave requests
router.get("/", asyncHandler(LeaveRequestController.getLeaveRequests));


export default router;