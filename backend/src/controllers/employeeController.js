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
