import pool from "../config/db.js";

export const createStorehouse = async (req, res) => {
  try {
    const { name, location, company_id } = req.body;
    const result = await pool.query(
      `INSERT INTO storehouses (name, location, company_id) VALUES ($1, $2, $3) RETURNING *`,
      [name, location, company_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating storehouse:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getStorehousesByCompany = async (req, res) => {
  try {
    const { company_id } = req.params;
    const result = await pool.query(
      `SELECT * FROM storehouses WHERE company_id = $1`,
      [company_id]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching storehouses:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
