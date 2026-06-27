import { Router } from "express";
import EmployeeController from "../controller/employee.controller.js";
import asyncHandler from "../../../utils/asyncHandler.js";

const router = Router();

router.get("/:employeeId/leave-balance", asyncHandler(EmployeeController.getLeaveBalance));

export default router;