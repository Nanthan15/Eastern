import pool from "../config/db.js";

export const createUser = async (userData) => {
  let { name, email, password, role_id, company_id, manager_id } = userData;
  manager_id = manager_id === '' ? null : manager_id;
  const result = await pool.query(
    `INSERT INTO users (name, email, password, role_id, company_id, manager_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, name, email, role_id`,
    [name, email, password, role_id, company_id, manager_id]
  );
  return result.rows[0];
};

export const findUserByEmail = async (email) => {
  const result = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
  return result.rows[0];
};

