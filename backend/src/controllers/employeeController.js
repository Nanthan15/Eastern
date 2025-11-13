import { createEmployee, getEmployees } from "../models/employeeModel.js";
import pool from "../config/db.js";

export const addEmployee = async (req,res)=>{
  try {
    const employee = await createEmployee(req.body);
    res.status(201).json(employee);
  } catch(err){
    console.error(err);
    res.status(500).json({ message:"Error creating employee" });
  }
};

export const listEmployees = async (req,res)=>{
  try {
    const { company_id } = req.params;
    const data = await getEmployees(company_id);
    res.json(data);
  } catch(err){
    res.status(500).json({ message:"Error fetching employees" });
  }
};


export const listEmployeesBySubsidiary = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT 
         u.id,
         u.name,
         u.email,
         u.role_id,
         u.manager_id,
         COALESCE(w.balance, 0) AS balance
       FROM users u
       LEFT JOIN employee_wallets w ON u.id = w.employee_id
       WHERE u.subsidiary_id = $1 AND u.role_id = 4
       ORDER BY u.id DESC`,
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching employees by subsidiary:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

