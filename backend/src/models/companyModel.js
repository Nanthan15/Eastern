import pool from "../config/db.js";

export const createCompany = async ({ name, contact_email }) => {
  const result = await pool.query(
    `INSERT INTO companies (name, contact_email) VALUES ($1,$2) RETURNING *`,
    [name, contact_email]
  );
  return result.rows[0];
};

export const getCompanies = async () => {
  const result = await pool.query(`SELECT * FROM companies ORDER BY id DESC`);
  return result.rows;
};