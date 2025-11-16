import { useEffect, useState } from "react";
import { Container, Table, Badge, Alert } from "react-bootstrap";
import API from "../services/api";

function StatusPage() {
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userId = storedUser?.id;
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const src = "https://unpkg.com/@lottiefiles/dotlottie-wc@0.8.5/dist/dotlottie-wc.js";
    if (!document.querySelector(`script[src="${src}"]`)) {
      const s = document.createElement("script");
      s.src = src;
      s.type = "module";
      s.async = true;
      document.head.appendChild(s);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const startTime = Date.now();
      const { data } = await API.get(`/booking/list/${userId}`);
      const elapsedTime = Date.now() - startTime;
      const minLoadTime = 2500; // 2.5 seconds minimum

      // Wait remaining time if needed
      if (elapsedTime < minLoadTime) {
        await new Promise(resolve => setTimeout(resolve, minLoadTime - elapsedTime));
      }

      setBookings(data);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: "warning",
      approved: "success",
      rejected: "danger",
      completed: "info",
    };
    return statusMap[status?.toLowerCase()] || "secondary";
  };

  const getTravelIcon = (type) => {
    return type?.toLowerCase() === "flight" ? "✈️" : "🏨";
  };

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
        .bookings-card {
          background: white;
          border-radius: 15px;
          padding: 30px;
          box-shadow: 0 5px 20px rgba(13, 71, 161, 0.08);
          border: 1px solid rgba(0, 188, 212, 0.1);
        }
        .bookings-card h5 {
          color: #0D47A1;
          font-weight: 700;
          margin-bottom: 25px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .booking-table {
          border-collapse: collapse;
        }
        .booking-table thead {
          background: linear-gradient(135deg, #0D47A1 0%, #00BCD4 100%);
          color: white;
        }
        .booking-table thead th {
          border: none;
          padding: 15px;
          font-weight: 600;
          letter-spacing: 0.5px;
        }
        .booking-table tbody tr {
          border-bottom: 1px solid #E3F2FD;
          transition: all 0.2s ease;
        }
        .booking-table tbody tr:hover {
          background: #F8FBFF;
        }
        .booking-table tbody td {
          padding: 15px;
          vertical-align: middle;
        }
        .ref-no {
          font-weight: 600;
          color: #0D47A1;
        }
        .travel-type {
          font-weight: 600;
          font-size: 15px;
        }
        .city-route {
          color: #666;
          font-size: 14px;
        }
        .status-badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .empty-state {
          text-align: center;
          padding: 60px 20px;
        }
        .empty-state-icon {
          font-size: 64px;
          margin-bottom: 20px;
        }
        .empty-state-text {
          color: #999;
          font-size: 16px;
        }
        .bookings-loader {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
        }
        .bookings-loader dotlottie-wc {
          width: 100px;
          height: 100px;
        }
        .full-page-loader {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.2);
          -webkit-backdrop-filter: blur(4px);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }
        .full-page-loader dotlottie-wc {
          width: 350px;
          height: 350px;
        }
      `}</style>

      <div className="status-container">
        <Container>
          <div className="status-header">
            <span className="status-header-icon">📊</span>
            <h2>My Booking Status</h2>
            <p>Track your travel bookings and their approval status</p>
          </div>

          {error && <Alert variant="danger">{error}</Alert>}

          <div className="bookings-card">
            <h5>📋 Recent Bookings</h5>

            {bookings.length === 0 && !loading ? (
              <div className="empty-state">
                <div className="empty-state-icon">🎫</div>
                <div className="empty-state-text">No bookings found. Create one to get started!</div>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <Table className="booking-table" hover>
                  <thead>
                    <tr>
                      <th>Reference No</th>
                      <th>Travel Type</th>
                      <th>Route</th>
                      <th>Travel Date</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking.id}>
                        <td className="ref-no">{booking.reference_no}</td>
                        <td className="travel-type">
                          {getTravelIcon(booking.travel_type)} {booking.travel_type}
                        </td>
                        <td className="city-route">
                          {booking.from_city ? `${booking.from_city} → ` : ""}{booking.to_city || "-"}
                        </td>
                        <td>{booking.travel_date || "-"}</td>
                        <td>
                          <strong>₹{booking.total_amount?.toLocaleString() || "0"}</strong>
                        </td>
                        <td>
                          <Badge bg={getStatusBadge(booking.status)} className="status-badge">
                            {booking.status || "Pending"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </div>
        </Container>
      </div>

      {loading && (
        <div className="full-page-loader">
          <dotlottie-wc
            src="https://lottie.host/25d6c398-cd85-4d7e-b742-29823092f08a/BO9V7489Yz.lottie"
            autoplay
            loop
          />
        </div>
      )}
    </>
  );
}

export default StatusPage;
