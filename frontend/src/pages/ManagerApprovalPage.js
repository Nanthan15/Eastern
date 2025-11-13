import { useEffect, useState } from "react";
import { Container, Table, Button, Alert } from "react-bootstrap";
import API from "../services/api";

function ManagerApprovalPage() {
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const managerId = storedUser?.id;

  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState("");

  // fetch all pending bookings for manager
  const fetchManagerBookings = async () => {
    try {
      const { data } = await API.get(`/booking/manager/${managerId}`);
      setBookings(data);
    } catch (err) {
      console.error("Error fetching manager bookings:", err);
      setMessage("Error fetching pending approvals.");
    }
  };

  useEffect(() => {
    fetchManagerBookings();
    // eslint-disable-next-line
  }, []);

  // approve a booking
  const handleApprove = async (id) => {
    try {
      await API.post(`/booking/approve/${id}`);
      setMessage("✅ Booking approved successfully!");
      fetchManagerBookings();
    } catch (err) {
      console.error("Error approving booking:", err);
      setMessage("❌ Failed to approve booking");
    }
  };

  // reject a booking
  const handleReject = async (id) => {
    try {
      await API.post(`/booking/reject/${id}`);
      setMessage("🚫 Booking rejected!");
      fetchManagerBookings();
    } catch (err) {
      console.error("Error rejecting booking:", err);
      setMessage("❌ Failed to reject booking");
    }
  };

  return (
    <Container className="mt-4">
      <h4 className="text-primary mb-3">Manager Approvals</h4>
      {message && <Alert variant="info">{message}</Alert>}

      <Table bordered hover>
        <thead className="table-light">
          <tr>
            <th>Ref No</th>
            <th>Employee</th>
            <th>Travel Type</th>
            <th>From</th>
            <th>To</th>
            <th>Purpose</th>
            <th>Storehouse</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {bookings.length === 0 ? (
            <tr>
              <td colSpan="10" className="text-center text-muted">
                No pending bookings found.
              </td>
            </tr>
          ) : (
            bookings.map((b) => (
              <tr key={b.id}>
                <td>{b.reference_no}</td>
                <td>{b.employee_name}</td>
                <td>{b.travel_type}</td>
                <td>{b.from_city || "-"}</td>
                <td>{b.to_city || "-"}</td>
                <td>{b.purpose || "-"}</td>
                <td>{b.storehouse_name || b.storehouse_id || "-"}</td>
                <td>₹{b.total_amount}</td>
                <td className="text-capitalize">{b.status}</td>
                <td>
                  <Button
                    size="sm"
                    variant="success"
                    className="me-2"
                    onClick={() => handleApprove(b.id)}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleReject(b.id)}
                  >
                    Reject
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </Container>
  );
}

export default ManagerApprovalPage;
