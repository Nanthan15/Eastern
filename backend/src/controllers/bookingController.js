// src/controllers/bookingController.js
import pool from "../config/db.js";

/*
  Supported payload shapes:
  - Flight, one-way:
    { travel_type: "flight", trip_type: "oneway", travel_date: "YYYY-MM-DD", ... }
  - Flight, round-trip:
    { travel_type: "flight", trip_type: "roundtrip", travel_date, return_date, ... }
  - Flight, multicity:
    { travel_type: "flight", trip_type: "multicity", itinerary: [{from_city, to_city, date}, ...], ... }
  - Hotel:
    { travel_type: "hotel", check_in: "YYYY-MM-DD", check_out: "YYYY-MM-DD", ... }
*/

export const getBookingOptions = async (req, res) => {
  try {
    const { type } = req.query;
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

export const createBooking = async (req, res) => {
  try {
    const payload = req.body;

    // common required fields
    const user_id = payload.user_id;
    const company_id = payload.company_id;
    const storehouse_id = payload.storehouse_id;
    const travel_type = payload.travel_type; // 'flight' | 'hotel'
    const mock_item_id = payload.mock_item_id;
    const purpose = payload.purpose || null;
    const total_amount = payload.total_amount || 0;

    if (!user_id) return res.status(400).json({ message: "user_id required" });
    if (!company_id) return res.status(400).json({ message: "company_id required" });
    if (!storehouse_id) return res.status(400).json({ message: "storehouse_id required" });
    if (!travel_type) return res.status(400).json({ message: "travel_type required" });
    if (!mock_item_id) return res.status(400).json({ message: "mock_item_id required" });

    // get manager of this user (if any)
    const mgrRes = await pool.query("SELECT manager_id FROM users WHERE id=$1", [user_id]);
    const manager_id = mgrRes.rows[0] ? mgrRes.rows[0].manager_id : null;

    // prepare fields depending on travel_type
    let travel_date = null;
    let return_date = null;
    let check_in = null;
    let check_out = null;
    let from_city = payload.from_city || null;
    let to_city = payload.to_city || null;
    let trip_type = null;
    let itinerary = null; // JSONB for multicity

    if (travel_type === "flight") {
      trip_type = payload.trip_type || "oneway";

      if (trip_type === "oneway") {
        if (!payload.travel_date) return res.status(400).json({ message: "travel_date required for one-way flight" });
        travel_date = payload.travel_date;
      } else if (trip_type === "roundtrip") {
        if (!payload.travel_date || !payload.return_date) {
          return res.status(400).json({ message: "travel_date and return_date required for round-trip" });
        }
        travel_date = payload.travel_date;
        return_date = payload.return_date;
      } else if (trip_type === "multicity") {
        if (!Array.isArray(payload.itinerary) || payload.itinerary.length < 1) {
          return res.status(400).json({ message: "itinerary required for multicity flights" });
        }
        // validate itinerary items minimally
        const bad = payload.itinerary.find((leg) => !leg.from_city || !leg.to_city || !leg.date);
        if (bad) return res.status(400).json({ message: "each itinerary leg must have from_city, to_city and date" });
        itinerary = JSON.stringify(payload.itinerary);
      } else {
        return res.status(400).json({ message: "invalid trip_type" });
      }
    } else if (travel_type === "hotel") {
      // hotels use check-in/out
      if (!payload.check_in || !payload.check_out) {
        return res.status(400).json({ message: "check_in and check_out required for hotel" });
      }
      check_in = payload.check_in;
      check_out = payload.check_out;
      // map hotel's city into to_city for display
      to_city = payload.to_city || payload.city || null;
      from_city = null;
    } else {
      return res.status(400).json({ message: "unsupported travel_type" });
    }

    const reference_no = `BK-${Date.now()}`;

    const insertSql = `
      INSERT INTO bookings
      (user_id, manager_id, company_id, storehouse_id, travel_type, trip_type, mock_item_id,
       from_city, to_city, travel_date, return_date, check_in, check_out, itinerary, purpose, total_amount, status, reference_no, created_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,'pending',$17,NOW())
      RETURNING *`;

    const values = [
      user_id,
      manager_id,
      company_id,
      storehouse_id,
      travel_type,
      trip_type,
      mock_item_id,
      from_city,
      to_city,
      travel_date,
      return_date,
      check_in,
      check_out,
      itinerary,
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

export const listBookings = async (req, res) => {
  try {
    const { user_id } = req.params;

    const result = await pool.query(
      `
      SELECT 
        b.*,
        u.name AS employee_name,
        s.name AS storehouse_name,

        -- Build a clean itinerary JSON
        CASE 
          WHEN b.travel_type = 'flight' THEN
            jsonb_build_object(
              'type', b.travel_type,
              'trip_mode', b.trip_type,
              'segments', COALESCE(b.itinerary, '[]'::jsonb),
              'from_city', b.from_city,
              'to_city', b.to_city,
              'travel_date', b.travel_date,
              'return_date', b.return_date
            )
          WHEN b.travel_type = 'hotel' THEN
            jsonb_build_object(
              'type', b.travel_type,
              'city', b.to_city,
              'check_in', b.check_in,
              'check_out', b.check_out
            )
          ELSE NULL
        END AS itinerary

      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN storehouses s ON b.storehouse_id = s.id
      WHERE b.user_id = $1
      ORDER BY b.id DESC
      `,
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
