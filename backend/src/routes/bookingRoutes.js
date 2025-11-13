import express from "express";
import {
  getBookingOptions,
  createBooking,
  listBookings,
  approveBooking,
  cancelBooking,
  listManagerBookings,
  rejectBooking,
} from "../controllers/bookingController.js";
import { verifyToken , isRole} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/options", verifyToken, getBookingOptions);
router.post("/create", verifyToken, isRole([4]), createBooking); // i'm allowing only employee to create the booking
router.get("/list/:user_id", verifyToken, listBookings);
router.post("/approve/:id", verifyToken, approveBooking);
router.get("/manager/:manager_id", verifyToken, listManagerBookings);
router.post("/reject/:id", verifyToken, rejectBooking);
router.post("/cancel/:id", verifyToken, cancelBooking);

export default router;
