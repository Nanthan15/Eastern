import express from "express";
import {
  getMainWallet,
  allocateToCompany,
  getCompanyWallet,
  allocateToEmployee,
  getEmployeeWallet,
  getAllTransactions,
} from "../controllers/walletController.js";
import { verifyToken, verifySubsidiaryScope } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/main", verifyToken, getMainWallet);
router.post("/allocate-to-company", verifyToken, allocateToCompany);
router.get("/company/:id", verifyToken,verifySubsidiaryScope, getCompanyWallet);
router.post("/allocate-to-employee", verifyToken,verifySubsidiaryScope, allocateToEmployee);
router.get("/employee/:id", verifyToken,verifySubsidiaryScope, getEmployeeWallet);

//without 
router.get("/employee/u/:id", verifyToken, getEmployeeWallet);
router.get("/transactions", verifyToken, getAllTransactions);

export default router;
