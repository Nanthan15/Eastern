import { useEffect, useState } from "react";
import { Container, Table, Badge, Alert } from "react-bootstrap";
import API from "../services/api";

function StatusPage() {
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userId = storedUser?.id;
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // fetch bookings
  const fetchBookings = async () => {
    try {
      const { data } = await API.get(`/booking/list/user/${userId}`);
      setBookings(data);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError("Failed to load bookings. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <>
      <style>{`
        .status-container {
          background: linear-gradient(135deg, #f5f7fa 0%, #e8eef5 100%);
          min-height: 100vh;
          padding: 40px 20px;
        }
        .status-header {
          text-align: center;
          margin-bottom: 40px;
        }
        .status-header h2 {
          background: linear-gradient(135deg, #0D47A1 0%, #00BCD4 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 700;
          font-size: 36px;
          margin-bottom: 10px;
        }
        .status-header p {
          color: #666;
          font-size: 16px;
        }
        .booking-table {
          border-collapse: collapse;
          width: 100%;
        }
        .booking-table th,
        .booking-table td {
          border: 1px solid #e3f2fd;
          padding: 12px 15px;
          text-align: left;
        }
        .booking-table th {
          background: linear-gradient(135deg, #0D47A1 0%, #00BCD4 100%);
          color: white;
          font-weight: 600;
        }
        .booking-table tbody tr {
          transition: background 0.3s;
        }
        .booking-table tbody tr:hover {
          background: #f8fbff;
        }
        .badge-status {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .badge-pending {
          background-color: #ffc107;
          color: #fff;
        }
        .badge-approved {
          background-color: #28a745;
          color: #fff;
        }
        .badge-rejected {
          background-color: #dc3545;
          color: #fff;
        }
        .alert-custom {
          border-radius: 10px;
          border: none;
          padding: 15px 20px;
          margin-bottom: 20px;
          font-weight: 500;
          background: rgba(0, 188, 212, 0.1);
          color: #0D47A1;
          border-left: 4px solid #00BCD4;
        }
      `}</style>

      <div className="status-container">
        <Container>
          <div className="status-header">
            <h2>📊 Booking Status</h2>
            <p>Track the status of your bookings</p>
          </div>

          {error && <Alert className="alert-custom">{error}</Alert>}

          <div style={{ overflowX: "auto" }}>
            <Table className="booking-table" hover>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Type</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Travel Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center">
                      No bookings found.
                    </td>
                  </tr>
                ) : (
                  bookings.map((booking) => (
                    <tr key={booking.id}>
                      <td>{booking.id}</td>
                      <td>{booking.travel_type === "flight" ? "✈️ Flight" : "🏨 Hotel"}</td>
                      <td>{booking.from_city}</td>
                      <td>{booking.to_city}</td>
                      <td>{new Date(booking.travel_date).toLocaleDateString()}</td>
                      <td>
                        {booking.status === "pending" && (
                          <Badge className="badge-status badge-pending">Pending</Badge>
                        )}
                        {booking.status === "approved" && (
                          <Badge className="badge-status badge-approved">Approved</Badge>
                        )}
                        {booking.status === "rejected" && (
                          <Badge className="badge-status badge-rejected">Rejected</Badge>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Container>
      </div>
    </>
  );
}

export default StatusPage;