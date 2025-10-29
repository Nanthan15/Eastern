import express from "express";
import { verifyToken, canManageDepartments } from "../middleware/authMiddleware.js";
import { createDepartment, listDepartments, deleteDepartment } from "../controllers/departmentController.js";

const router = express.Router();

router.post("/create", verifyToken, canManageDepartments, createDepartment);
router.get("/list/:company_id", verifyToken, canManageDepartments, listDepartments);
router.delete("/:id", verifyToken, canManageDepartments, deleteDepartment);

export default router;