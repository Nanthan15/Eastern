import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { createUser, findUserByEmail } from "../models/userModel.js";
import pool from "../config/db.js";

dotenv.config();

// Register user (employee, manager, admin)
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role_id, company_id, manager_id, subsidiary_id } = req.body;

    // Check if email already exists
    const existing = await findUserByEmail(email);
    if (existing) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with subsidiary_id included
    const user = await createUser({
      name,
      email,
      password: hashedPassword,
      role_id,
      company_id,
      manager_id,
      subsidiary_id,
    });

    res.status(201).json({ message: "User registered successfully", user });
  } catch (err) {
    console.error("❌ Error registering user:", err.message);
    res.status(500).json({ message: "Error registering user" });
  }
};

// Login user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 🔹 Fetch user with role and company names
    const result = await pool.query(`
      SELECT 
        u.*, 
        r.name AS role_name,
        c.name AS company_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN companies c ON u.subsidiary_id = c.id
      WHERE u.email = $1
    `, [email]);

    const user = result.rows[0];
    if (!user) return res.status(404).json({ message: "User not found" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ message: "Invalid password" });

    // 🔹 Create token with required data
    const token = jwt.sign(
      {
        id: user.id,
        role_id: user.role_id,
        company_id: user.company_id,
        subsidiary_id: user.subsidiary_id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 🔹 Include readable names in the response
    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role_id: user.role_id,
        role_name: user.role_name,
        company_name: user.company_name,
        company_id: user.company_id,
        subsidiary_id: user.subsidiary_id,
      },
    });
  } catch (err) {
    console.error("❌ Login failed:", err.message);
    res.status(500).json({ message: "Login failed" });
  }
};
