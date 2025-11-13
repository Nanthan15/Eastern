import { useEffect, useState } from "react";
import { Container, Form, Button, Table, Alert, Row, Col, Card } from "react-bootstrap";
import API from "../services/api";

function BookingPage() {
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userId = storedUser?.id;
  const companyId = storedUser?.company_id;

  const [walletBalance, setWalletBalance] = useState(0);
  const [travelType, setTravelType] = useState("flight");
  const [options, setOptions] = useState([]);
  const [storehouses, setStorehouses] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState({
    storehouse_id: "",
    mock_item_id: "",
    from_city: "",
    to_city: "",
    travel_date: "",
    return_date: "",
    purpose: "",
    total_amount: "",
  });
  const [message, setMessage] = useState("");

  // fetch wallet
  const fetchWallet = async () => {
    try {
      const { data } = await API.get(`/wallet/employee/u/${userId}`);
      setWalletBalance(data.balance || 0);
    } catch (err) {
      console.error("Error fetching wallet:", err);
    }
  };

  // fetch mock flight/hotel options
  const fetchOptions = async (type) => {
    try {
      const { data } = await API.get(`/booking/options?type=${type}`);
      setOptions(data);
    } catch (err) {
      console.error("Error fetching mock options:", err);
    }
  };

  // fetch storehouses
  const fetchStorehouses = async () => {
    try {
      const { data } = await API.get(`/storehouse/list/${companyId}`);
      setStorehouses(data);
    } catch (err) {
      console.error("Error fetching storehouses:", err);
    }
  };

  // fetch user bookings
  const fetchBookings = async () => {
    try {
      const { data } = await API.get(`/booking/list/${userId}`);
      setBookings(data);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    }
  };

  useEffect(() => {
    fetchWallet();
    fetchOptions(travelType);
    fetchStorehouses();
    fetchBookings();
    // eslint-disable-next-line
  }, [travelType]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelectOption = (e) => {
    const itemId = e.target.value;
    setForm({ ...form, mock_item_id: itemId });
    const selected = options.find((o) => String(o.id) === String(itemId));

    if (selected && travelType === "flight") {
      setForm((f) => ({
        ...f,
        from_city: selected.from_city,
        to_city: selected.to_city,
        total_amount: selected.price,
      }));
    }
    if (selected && travelType === "hotel") {
      setForm((f) => ({
        ...f,
        from_city: "",
        to_city: selected.city,
        total_amount: selected.price_per_night,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (Number(form.total_amount) > Number(walletBalance)) {
      setMessage("❌ Insufficient balance in your wallet!");
      return;
    }

    try {
      const payload = {
        user_id: userId,
        company_id: companyId,
        storehouse_id: form.storehouse_id,
        travel_type: travelType,
        mock_item_id: form.mock_item_id,
        from_city: form.from_city,
        to_city: form.to_city,
        travel_date: form.travel_date,
        return_date: form.return_date,
        purpose: form.purpose,
        total_amount: form.total_amount,
      };

      await API.post("/booking/create", payload);
      setMessage("✅ Booking created successfully!");
      setForm({
        storehouse_id: "",
        mock_item_id: "",
        from_city: "",
        to_city: "",
        travel_date: "",
        return_date: "",
        purpose: "",
        total_amount: "",
      });
      fetchBookings();
      fetchWallet(); // refresh wallet after booking
    } catch (err) {
      console.error("Create booking error:", err);
      setMessage("❌ Failed to create booking");
    }
  };

  return (
    <Container className="mt-4">
      <h4 className="text-primary mb-3">Book Your Travel</h4>
      {message && <Alert variant="info">{message}</Alert>}

      <Row>
        <Col md={6}>
          <Card className="p-3 mb-3 shadow-sm">
            <h6 className="text-success">Available Wallet Balance: ₹{walletBalance}</h6>
          </Card>

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Travel Type</Form.Label>
              <Form.Select
                value={travelType}
                onChange={(e) => setTravelType(e.target.value)}
              >
                <option value="flight">Flight</option>
                <option value="hotel">Hotel</option>
              </Form.Select>
            </Form.Group>

            {travelType === "flight" && (
              <>
                <Form.Group className="mb-2">
                  <Form.Label>From City</Form.Label>
                  <Form.Control
                    name="from_city"
                    value={form.from_city}
                    onChange={handleChange}
                  />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>To City</Form.Label>
                  <Form.Control
                    name="to_city"
                    value={form.to_city}
                    onChange={handleChange}
                  />
                </Form.Group>
              </>
            )}

            <Form.Group className="mb-2">
              <Form.Label>Travel Date</Form.Label>
              <Form.Control
                type="date"
                name="travel_date"
                value={form.travel_date}
                onChange={handleChange}
              />
            </Form.Group>

            {travelType === "flight" && (
              <Form.Group className="mb-2">
                <Form.Label>Return Date</Form.Label>
                <Form.Control
                  type="date"
                  name="return_date"
                  value={form.return_date}
                  onChange={handleChange}
                />
              </Form.Group>
            )}

            <Form.Group className="mb-2">
              <Form.Label>Select Storehouse</Form.Label>
              <Form.Select
                name="storehouse_id"
                value={form.storehouse_id}
                onChange={handleChange}
                required
              >
                <option value="">Select Storehouse</option>
                {storehouses.map((s) => (
                  <option key={s.id ?? s.storehouse_id} value={s.id ?? s.storehouse_id}>
                    {(s.name ?? s.storehouse_name) +
                      (s.location ? ` — ${s.location}` : "")}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Select {travelType === "flight" ? "Flight" : "Hotel"}</Form.Label>
              <Form.Select
                name="mock_item_id"
                value={form.mock_item_id}
                onChange={handleSelectOption}
                required
              >
                <option value="">Select an option</option>
                {options.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {travelType === "flight"
                      ? `${opt.from_city} → ${opt.to_city} (${opt.airline}) - ₹${opt.price}`
                      : `${opt.hotel_name} (${opt.city}) - ₹${opt.price_per_night}`}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Total Amount (INR)</Form.Label>
              <Form.Control
                name="total_amount"
                value={form.total_amount}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Purpose</Form.Label>
              <Form.Control
                name="purpose"
                value={form.purpose}
                onChange={handleChange}
              />
            </Form.Group>

            <Button type="submit" variant="primary" className="w-100">
              Create Booking
            </Button>
          </Form>
        </Col>

        <Col md={6}>
          <h5 className="text-secondary mt-2">My Bookings</h5>
          <Table bordered hover>
            <thead>
              <tr>
                <th>Ref No</th>
                <th>Type</th>
                <th>From</th>
                <th>To</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td>{b.reference_no}</td>
                  <td>{b.travel_type}</td>
                  <td>{b.from_city || "-"}</td>
                  <td>{b.to_city || "-"}</td>
                  <td>{b.status}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
}

export default BookingPage;
