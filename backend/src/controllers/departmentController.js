import pool from "../config/db.js";

// ➕ Create Department
export const createDepartment = async (req, res) => {
  try {
    const { name, company_id } = req.body;
    const result = await pool.query(
      `INSERT INTO departments (name, company_id) VALUES ($1,$2) RETURNING *`,
      [name, company_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating department:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// 📋 List Departments
export const listDepartments = async (req, res) => {
  try {
    const { company_id } = req.params;
    const result = await pool.query(
      `SELECT * FROM departments WHERE company_id = $1 ORDER BY id DESC`,
      [company_id]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching departments:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ❌ Delete Department
export const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(`DELETE FROM departments WHERE id = $1`, [id]);
    res.status(200).json({ message: "Department deleted successfully" });
  } catch (err) {
    console.error("Error deleting department:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
