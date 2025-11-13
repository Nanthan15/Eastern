import pool from "../config/db.js";

/* ================================
   1. GET Main Wallet
================================ */
export const getMainWallet = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM main_wallet LIMIT 1");
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching main wallet:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/* ================================
   2. Allocate funds to Subsidiary
================================ */
export const allocateToCompany = async (req, res) => {
  try {
    const { company_id, amount } = req.body;

    // 1️⃣ Fetch main wallet
    
    const mainWallet = await pool.query("SELECT * FROM main_wallet LIMIT 1");
    if (!mainWallet.rows.length) return res.status(404).json({ message: "Main wallet not found" });

    const { total_balance, allocated_balance } = mainWallet.rows[0];

    if (Number(allocated_balance) + Number(amount) > Number(total_balance)) {
      return res.status(400).json({ message: "Insufficient balance in main wallet" });
    }

    // 2️⃣ Update or create company wallet
    const companyWallet = await pool.query("SELECT * FROM company_wallets WHERE company_id=$1", [company_id]);
    if (companyWallet.rows.length) {
      await pool.query(
        "UPDATE company_wallets SET allocated_amount = allocated_amount + $1 WHERE company_id=$2",
        [amount, company_id]
      );
    } else {
      await pool.query("INSERT INTO company_wallets (company_id, allocated_amount) VALUES ($1,$2)", [
        company_id,
        amount,
      ]);
    }

    // 3️⃣ Update main wallet allocated balance
    await pool.query("UPDATE main_wallet SET allocated_balance = allocated_balance + $1", [amount]);

    // 4️⃣ Add transaction
    await pool.query(
      "INSERT INTO transactions (from_level, from_id, to_level, to_id, amount, description) VALUES ('main', 1, 'company', $1, $2, $3)",
      [company_id, amount, "Allocated to subsidiary"]
    );

    res.json({ message: "Funds allocated successfully to subsidiary" });
  } catch (err) {
    console.error("Error allocating funds to company:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/* ================================
   3. GET Company Wallet
================================ */
export const getCompanyWallet = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM company_wallets WHERE company_id=$1", [id]);
    res.json(result.rows[0] || { allocated_amount: 0, used_amount: 0 });
  } catch (err) {
    console.error("Error fetching company wallet:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/* ================================
   4. Allocate funds to Employee
================================ */
export const allocateToEmployee = async (req, res) => {
  try {
    const { employee_id, company_id, amount } = req.body;

    // Check company wallet balance
    const companyWallet = await pool.query("SELECT * FROM company_wallets WHERE company_id=$1", [company_id]);
    if (!companyWallet.rows.length) {
      return res.status(400).json({ message: "Company wallet not found" });
    }

    const { allocated_amount, used_amount } = companyWallet.rows[0];
    if (Number(used_amount) + Number(amount) > Number(allocated_amount)) {
      return res.status(400).json({ message: "Insufficient subsidiary balance" });
    }

    // Update or create employee wallet
    const empWallet = await pool.query("SELECT * FROM employee_wallets WHERE employee_id=$1", [employee_id]);
    if (empWallet.rows.length) {
      await pool.query("UPDATE employee_wallets SET balance = balance + $1 WHERE employee_id=$2", [amount, employee_id]);
    } else {
      await pool.query("INSERT INTO employee_wallets (employee_id, company_id, balance) VALUES ($1,$2,$3)", [
        employee_id,
        company_id,
        amount,
      ]);
    }

    // Update company used amount
    await pool.query("UPDATE company_wallets SET used_amount = used_amount + $1 WHERE company_id=$2", [
      amount,
      company_id,
    ]);

    // Add transaction
    await pool.query(
      "INSERT INTO transactions (from_level, from_id, to_level, to_id, amount, description) VALUES ('company', $1, 'employee', $2, $3, $4)",
      [company_id, employee_id, amount, "Allocated to employee"]
    );

    res.json({ message: "Funds allocated successfully to employee" });
  } catch (err) {
    console.error("Error allocating funds to employee:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/* ================================
   5. GET Employee Wallet
================================ */
export const getEmployeeWallet = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM employee_wallets WHERE employee_id=$1", [id]);
    res.json(result.rows[0] || { balance: 0 });
  } catch (err) {
    console.error("Error fetching employee wallet:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/* ================================
   6. GET All Transactions
================================ */
export const getAllTransactions = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM transactions ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching transactions:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
