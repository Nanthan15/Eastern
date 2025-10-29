import express from "express";
import { createStorehouse, getStorehousesByCompany } from "../controllers/storehouseController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();
router.post("/create", verifyToken, createStorehouse);
router.get("/list/:company_id", verifyToken, getStorehousesByCompany);

export default router;



//to get diffrentiated:
//,enforceCompanyScope and add this at top import { enforceCompanyScope } from "../middleware/authMiddleware.js";