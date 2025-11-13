import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";
import { verifyToken, isRole, canRegisterEmployees } from "../middleware/authMiddleware.js";


const router = express.Router();

router.post("/register", verifyToken,canRegisterEmployees, registerUser); // only SuperAdmin or CompanyAdmin can add
router.post("/login", loginUser);

export default router;

