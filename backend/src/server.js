import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import pool from "./config/db.js";

dotenv.config();
const app = express();

// Middleware and cors applicable
app.use(cors());
app.use(express.json());

// Basic route
app.get("/", (req, res) => {
  res.send("Eastern Travel Needz API is running 🚀");
});

// Import routes
// import userRoutes from "./routes/userRoutes.js";
// app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
