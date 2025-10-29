import { createCompany, getCompanies } from "../models/companyModel.js";
import pool from "../config/db.js";

export const addCompany = async (req,res)=>{
  try {
    const { name, contact_email } = req.body;
    const company = await createCompany({ name, contact_email });
    res.status(201).json(company);
  } catch(err){
    console.error(err);
    res.status(500).json({ message:"Error creating company" });
  }
};

export const listCompanies = async (req,res)=>{
  try {
    const data = await getCompanies();
    res.json(data);
  } catch(err){
    res.status(500).json({ message:"Error fetching companies" });
  }
};


export const createSubsidiary = async (req, res) => {
  try {
    const { name, parent_company_id } = req.body;
    const result = await pool.query(
      `INSERT INTO companies (name, parent_company_id) VALUES ($1, $2) RETURNING *`,
      [name, parent_company_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating subsidiary:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


