import pool from "../config/db.js";

/**
 * @desc Add a new company (main company only)
 * @route POST /company/add
 */
export const addCompany = async (req, res) => {
  try {
    const { name, contact_email } = req.body;

    if (!name || !contact_email) {
      return res.status(400).json({ message: "Name and contact email are required." });
    }

    const insertQuery = `
      INSERT INTO companies (name, contact_email, parent_company_id)
      VALUES ($1, $2, NULL)
      RETURNING id, name, contact_email, created_at
    `;

    const result = await pool.query(insertQuery, [name.trim(), contact_email.trim()]);
    res.status(201).json({ message: "Company created successfully", company: result.rows[0] });
  } catch (err) {
    console.error("❌ Error creating company:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * @desc List all companies (main + subsidiaries)
 * @route GET /company/companies
 */
export const listCompanies = async (req, res) => {
  try {
    const result = await pool.query(`SELECT id, name, contact_email, parent_company_id FROM companies ORDER BY id ASC`);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching companies:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * @desc Create a subsidiary (under main company id=1)
 * @route POST /company/create-subsidiary
 */
export const createSubsidiary = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Subsidiary name is required" });

    const parent_company_id = 1; // fixed for single main company setup

    const result = await pool.query(
      `INSERT INTO companies (name, parent_company_id) VALUES ($1, $2) RETURNING id, name, parent_company_id, created_at`,
      [name.trim(), parent_company_id]
    );

    res.status(201).json({
      message: "Subsidiary created successfully",
      subsidiary: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Error creating subsidiary:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * @desc List subsidiaries with wallet details
 * @route GET /company/subsidiaries
 */
export const listSubsidiaries = async (req, res) => {
  try {
    const query = `
      SELECT 
        c.id,
        c.name,
        COALESCE(w.allocated_amount, 0) AS allocated_amount,
        COALESCE(w.used_amount, 0) AS used_amount,
        COALESCE(w.allocated_amount - w.used_amount, 0) AS available_balance,
        c.created_at
      FROM companies c
      LEFT JOIN company_wallets w ON c.id = w.company_id
      WHERE c.parent_company_id IS NOT NULL
      ORDER BY c.id ASC
    `;
    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching subsidiaries:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
