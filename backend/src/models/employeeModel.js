import pool from "../config/db.js";
import bcrypt from "bcrypt";

export const createEmployee = async (data) => {
  const { name, email, password, role_id, company_id, manager_id, subsidiary_id } = data;
  const hashed = await bcrypt.hash(password, 10);

  const res = await pool.query(
    `INSERT INTO users (name, email, password, role_id, company_id, manager_id, subsidiary_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, name, email, role_id, subsidiary_id`,
    [name, email, hashed, role_id, company_id, manager_id, subsidiary_id]
  );

  return res.rows[0];
};

export const getEmployees = async (company_id) => {
  const res = await pool.query(
    `SELECT id, name, email, role_id, manager_id, subsidiary_id
     FROM users
     WHERE company_id = $1
     ORDER BY id DESC`,
    [company_id]
  );
  return res.rows;
};
