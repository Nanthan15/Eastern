import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import pool from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import storehouseRoutes from "./routes/storehouseRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import walletRoutes from "./routes/walletRoutes.js";


dotenv.config();
const app = express();

// Middleware and cors applicable
app.use(cors());
app.use(express.json());

// Basic route

app.get("/", (req, res) => res.send("Eastern Travel Needz API is running 🚀"));
app.use("/auth", authRoutes);

app.use("/department", departmentRoutes);
app.use("/company", companyRoutes);
app.use("/employee", employeeRoutes);
app.use("/storehouse", storehouseRoutes);
app.use("/booking", bookingRoutes);
app.use("/wallet", walletRoutes);


// Import routes
// import userRoutes from "./routes/userRoutes.js";
// app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
