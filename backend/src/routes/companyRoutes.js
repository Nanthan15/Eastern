import express from "express";
import { addCompany, listCompanies } from "../controllers/companyController.js";
import { verifyToken, isRole } from "../middleware/authMiddleware.js";

import { createSubsidiary } from "../controllers/companyController.js";

const router = express.Router();

// router.post("/companies", verifyToken, isRole([1]), addCompany);
// router.get("/companies", verifyToken, isRole([1]), listCompanies);
router.post("/create-subsidiary", verifyToken, isRole([1]), createSubsidiary);

export default router;
