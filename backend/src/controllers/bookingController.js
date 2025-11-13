import pool from "../config/db.js";

// Fetch mock flight/hotel options
export const getBookingOptions = async (req, res) => {
  try {
    const { type } = req.query; // flight or hotel
    if (type === "flight") {
      const result = await pool.query("SELECT * FROM mock_flights ORDER BY id");
      return res.json(result.rows);
    } else if (type === "hotel") {
      const result = await pool.query("SELECT * FROM mock_hotels ORDER BY id");
      return res.json(result.rows);
    } else {
      return res.status(400).json({ message: "Invalid type" });
    }
  } catch (err) {
    console.error("Error fetching mock data:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Create booking
export const createBooking = async (req, res) => {
  try {
    const {
      user_id,
      company_id,
      storehouse_id,
      travel_type,
      mock_item_id,
      from_city,
      to_city,
      travel_date,
      return_date,
      purpose,
      total_amount,
    } = req.body;

    // validate required
    if (!user_id) return res.status(400).json({ message: "user_id required" });
    if (!storehouse_id) return res.status(400).json({ message: "storehouse_id is required" });

    // get manager of this user
    const mgrRes = await pool.query("SELECT manager_id FROM users WHERE id=$1", [user_id]);
    const manager_id = mgrRes.rows[0] ? mgrRes.rows[0].manager_id : null;

    const reference_no = `BK-${Date.now()}`;

    const insertSql = `
      INSERT INTO bookings
      (user_id, manager_id, company_id, storehouse_id, travel_type, mock_item_id, from_city, to_city, travel_date, return_date, purpose, total_amount, status, reference_no, created_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'pending',$13,NOW())
      RETURNING *`;

    const values = [
      user_id,
      manager_id,
      company_id,
      storehouse_id,
      travel_type,
      mock_item_id,
      from_city,
      to_city,
      travel_date,
      return_date,
      purpose,
      total_amount,
      reference_no,
    ];

    const result = await pool.query(insertSql, values);

    return res.status(201).json({ message: "Booking created", booking: result.rows[0] });
  } catch (err) {
    console.error("Error creating booking:", err);
    return res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

// List all bookings (for a user or admin)
export const listBookings = async (req, res) => {
  try {
    const { user_id } = req.params;
    const result = await pool.query(
      `SELECT b.*, u.name AS employee_name, s.name AS storehouse_name
       FROM bookings b
       LEFT JOIN users u ON b.user_id = u.id
       LEFT JOIN storehouses s ON b.storehouse_id = s.id
       WHERE b.user_id = $1
       ORDER BY b.id DESC`,
      [user_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error listing bookings:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Approve booking
export const approveBooking = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    // Start transaction
    await client.query("BEGIN");

    // 1️⃣ Get booking details
    const bookingRes = await client.query("SELECT * FROM bookings WHERE id=$1", [id]);
    if (!bookingRes.rows.length) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Booking not found" });
    }

    const booking = bookingRes.rows[0];
    const { user_id, company_id, total_amount } = booking;

    // 2️⃣ Fetch employee wallet
    const empWalletRes = await client.query(
      "SELECT * FROM employee_wallets WHERE employee_id=$1",
      [user_id]
    );

    if (!empWalletRes.rows.length) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Employee wallet not found" });
    }

    const empWallet = empWalletRes.rows[0];

    if (Number(empWallet.balance) < Number(total_amount)) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Insufficient balance in employee wallet" });
    }

    // 3️⃣ Deduct from employee wallet
    await client.query(
      "UPDATE employee_wallets SET balance = balance - $1 WHERE employee_id=$2",
      [total_amount, user_id]
    );

    // 4️⃣ Update subsidiary wallet usage
    await client.query(
      "UPDATE company_wallets SET used_amount = used_amount + $1 WHERE company_id=$2",
      [total_amount, company_id]
    );

    // 5️⃣ Update booking status
    await client.query("UPDATE bookings SET status='approved' WHERE id=$1", [id]);

    // 6️⃣ Log transaction
    await client.query(
      "INSERT INTO transactions (from_level, from_id, to_level, to_id, amount, description) VALUES ('employee', $1, 'booking', $2, $3, $4)",
      [user_id, id, total_amount, "Booking amount deducted from employee wallet"]
    );

    await client.query("COMMIT");
    res.json({ message: "Booking approved and wallet updated successfully" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error approving booking:", err);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    client.release();
  }
};


// Cancel booking
export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(`UPDATE bookings SET status = 'cancelled' WHERE id = $1`, [id]);
    res.json({ message: "Booking cancelled" });
  } catch (err) {
    console.error("Error cancelling booking:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


export const listManagerBookings = async (req, res) => {
  try {
    const { manager_id } = req.params;
    const result = await pool.query(
      `SELECT b.*, u.name AS employee_name, s.name AS storehouse_name
       FROM bookings b
       LEFT JOIN users u ON b.user_id = u.id
       LEFT JOIN storehouses s ON b.storehouse_id = s.id
       WHERE b.manager_id = $1 AND b.status = 'pending'
       ORDER BY b.id DESC`,
      [manager_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching manager bookings:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


export const rejectBooking = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(`UPDATE bookings SET status = 'rejected' WHERE id = $1`, [id]);
    res.json({ message: "Booking rejected" });
  } catch (err) {
    console.error("Error rejecting booking:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
