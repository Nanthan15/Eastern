import pool from "../config/db.js";

export const createUser = async (data) => {
  const { name, email, password, role_id, company_id, manager_id, subsidiary_id } = data;
  const res = await pool.query(
    `INSERT INTO users (name, email, password, role_id, company_id, manager_id, subsidiary_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, name, email, role_id, company_id, subsidiary_id`,
    [name, email, password, role_id, company_id, manager_id, subsidiary_id]
  );
  return res.rows[0];
};

export const findUserByEmail = async (email) => {
  const result = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
  return result.rows[0];
};

