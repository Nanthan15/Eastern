import express from "express";
import { addEmployee, listEmployees } from "../controllers/employeeController.js";
import { verifyToken, isRole } from "../middleware/authMiddleware.js";
import { canManageEmployees } from "../middleware/authMiddleware.js";
import { listEmployeesBySubsidiary } from "../controllers/employeeController.js";

const router = express.Router();

router.post("/employees", verifyToken, canManageEmployees, addEmployee);
router.get("/employees/:company_id", verifyToken, canManageEmployees, listEmployees);
router.get("/subsidiary/:id", verifyToken, listEmployeesBySubsidiary);

export default router;
