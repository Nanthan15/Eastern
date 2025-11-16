import { useEffect, useState } from "react";
import { Container, Form, Button, Alert, Row, Col } from "react-bootstrap";
import API from "../services/api";

function BookingPage() {
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userId = storedUser?.id;
  const companyId = storedUser?.company_id;

  const [walletBalance, setWalletBalance] = useState(0);
  const [travelType, setTravelType] = useState("flight");
  const [options, setOptions] = useState([]);
  const [storehouses, setStorehouses] = useState([]);
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
  const [loading, setLoading] = useState(false);
  const [walletLoading, setWalletLoading] = useState(true);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  // load the dotlottie web component script once
  useEffect(() => {
    const src =
      "https://unpkg.com/@lottiefiles/dotlottie-wc@0.8.5/dist/dotlottie-wc.js";
    if (!document.querySelector(`script[src="${src}"]`)) {
      const s = document.createElement("script");
      s.src = src;
      s.type = "module";
      s.async = true;
      document.head.appendChild(s);
    }
  }, []);

  // fetch wallet
  const fetchWallet = async () => {
    try {
      setWalletLoading(true);
      const { data } = await API.get(`/wallet/employee/u/${userId}`);
      setWalletBalance(data.balance || 0);
    } catch (err) {
      console.error("Error fetching wallet:", err);
    } finally {
      setWalletLoading(false);
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

  useEffect(() => {
    fetchWallet();
    fetchOptions(travelType);
    fetchStorehouses();
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
    setLoading(true);

    if (Number(form.total_amount) > Number(walletBalance)) {
      setMessage("❌ Insufficient balance in your wallet!");
      setLoading(false);
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

      const startTime = Date.now();
      await API.post("/booking/create", payload);
      const elapsedTime = Date.now() - startTime;
      const minLoadTime = 2500; // 2.5 seconds minimum

      // Wait remaining time if needed
      if (elapsedTime < minLoadTime) {
        await new Promise((resolve) =>
          setTimeout(resolve, minLoadTime - elapsedTime)
        );
      }

      setMessage("✅ Booking created successfully!");
      setShowSuccessAlert(true);
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
      setTimeout(() => {
        setShowSuccessAlert(false);
      }, 3000);
      fetchWallet(); // refresh wallet after booking
    } catch (err) {
      console.error("Create booking error:", err);
      setMessage("❌ Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .booking-container {
          background: linear-gradient(135deg, #f5f7fa 0%, #e8eef5 100%);
          min-height: 100vh;
          padding: 40px 20px;
        }
        .booking-header {
          text-align: center;
          margin-bottom: 40px;
        }
        .booking-header h2 {
          background: linear-gradient(135deg, #0D47A1 0%, #00BCD4 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 700;
          font-size: 36px;
          margin-bottom: 10px;
        }
        .booking-header p {
          color: #666;
          font-size: 16px;
        }
        .wallet-card {
          background: linear-gradient(135deg, #0D47A1 0%, #00BCD4 100%);
          border-radius: 15px;
          padding: 25px;
          color: white;
          box-shadow: 0 10px 30px rgba(13, 71, 161, 0.2);
          margin-bottom: 30px;
          text-align: center;
        }
        .wallet-card h6 {
          font-size: 14px;
          opacity: 0.9;
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .wallet-card .balance-amount {
          font-size: 32px;
          font-weight: 700;
        }
        .booking-form-card {
          background: white;
          border-radius: 15px;
          padding: 30px;
          box-shadow: 0 5px 20px rgba(13, 71, 161, 0.08);
          border: 1px solid rgba(0, 188, 212, 0.1);
        }
        .booking-form-card h5 {
          color: #0D47A1;
          font-weight: 700;
          margin-bottom: 25px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .form-section-title {
          color: #0D47A1;
          font-weight: 600;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 20px 0 15px 0;
          padding-bottom: 10px;
          border-bottom: 2px solid #00BCD4;
        }
        .form-group label {
          color: #333;
          font-weight: 600;
          font-size: 14px;
          margin-bottom: 8px;
        }
        .form-control {
          border: 2px solid #E3F2FD !important;
          border-radius: 10px;
          padding: 10px 14px !important;
          font-size: 14px;
          transition: all 0.3s ease;
          background: #F8FBFF;
        }
        .form-control:focus {
          border-color: #00BCD4 !important;
          background: white !important;
          box-shadow: 0 0 0 3px rgba(0, 188, 212, 0.1) !important;
        }
        .form-select {
          border: 2px solid #E3F2FD !important;
          border-radius: 10px;
          padding: 10px 14px !important;
          font-size: 14px;
          background: #F8FBFF !important;
        }
        .form-select:focus {
          border-color: #00BCD4 !important;
          box-shadow: 0 0 0 3px rgba(0, 188, 212, 0.1) !important;
        }
        .submit-btn {
          background: linear-gradient(135deg, #0D47A1 0%, #00BCD4 100%);
          border: none;
          border-radius: 10px;
          padding: 12px 30px;
          font-weight: 600;
          color: white;
          margin-top: 20px;
          width: 100%;
          transition: all 0.3s ease;
          box-shadow: 0 10px 25px rgba(13, 71, 161, 0.3);
        }
        .submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 35px rgba(0, 188, 212, 0.4);
          color: white;
        }
        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .alert-custom {
          border-radius: 10px;
          border: none;
          padding: 15px 20px;
          margin-bottom: 20px;
          font-weight: 500;
        }
        .alert-success-custom {
          background: rgba(0, 188, 212, 0.1);
          color: #0D47A1;
          border-left: 4px solid #00BCD4;
        }
        .alert-danger-custom {
          background: rgba(244, 67, 54, 0.1);
          color: #C62828;
          border-left: 4px solid #F44336;
        }
        .wallet-loader {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100px;
          background: linear-gradient(135deg, #0D47A1 0%, #00BCD4 100%);
          border-radius: 15px;
          box-shadow: 0 10px 30px rgba(13, 71, 161, 0.2);
          margin-bottom: 30px;
        }
        .wallet-loader dotlottie-wc {
          width: 60px;
          height: 60px;
        }
        .success-alert-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.4);
          -webkit-backdrop-filter: blur(4px);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          animation: fadeInOverlay 0.3s ease-out;
        }
        @keyframes fadeInOverlay {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .success-alert-card {
          background: white;
          border-radius: 15px;
          padding: 40px 50px;
          box-shadow: 0 20px 60px rgba(13, 71, 161, 0.3);
          text-align: center;
          animation: slideUpAlert 0.4s ease-out;
          max-width: 500px;
        }
        @keyframes slideUpAlert {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .success-alert-card .alert-icon {
          font-size: 64px;
          margin-bottom: 20px;
        }
        .success-alert-card h4 {
          color: #0D47A1;
          font-weight: 700;
          margin-bottom: 10px;
        }
        .success-alert-card p {
          color: #666;
          margin: 0;
        }
        .form-submit-loader {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.3);
          -webkit-backdrop-filter: blur(4px);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }
        .form-submit-loader dotlottie-wc {
          width: 350px;
          height: 350px;
        }
      `}</style>

      <div className="booking-container">
        <Container>
          <div className="booking-header">
            <span>✈️</span>
            <h2>Book Your Travel</h2>
            <p>Plan your journey with ease</p>
          </div>

          <Row>
            <Col lg={8} className="mx-auto">
              {!walletLoading && (
                <div className="wallet-card">
                  <h6>💰 Available Wallet Balance</h6>
                  <div className="balance-amount">
                    ₹{walletBalance.toLocaleString()}
                  </div>
                </div>
              )}

              {message && !showSuccessAlert && (
                <Alert
                  className={`alert-custom ${
                    message.includes("✅")
                      ? "alert-success-custom"
                      : "alert-danger-custom"
                  }`}
                >
                  {message}
                </Alert>
              )}

              <div className="booking-form-card">
                <h5>📋 Travel Details</h5>

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Travel Type</Form.Label>
                    <Form.Select
                      value={travelType}
                      onChange={(e) => setTravelType(e.target.value)}
                    >
                      <option value="flight">✈️ Flight</option>
                      <option value="hotel">🏨 Hotel</option>
                    </Form.Select>
                  </Form.Group>

                  <div className="form-section-title">
                    {travelType === "flight"
                      ? "Flight Details"
                      : "Hotel Details"}
                  </div>

                  {travelType === "flight" && (
                    <>
                      <Form.Group className="mb-3">
                        <Form.Label>From City</Form.Label>
                        <Form.Control
                          name="from_city"
                          value={form.from_city}
                          onChange={handleChange}
                          placeholder="Departure city"
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>To City</Form.Label>
                        <Form.Control
                          name="to_city"
                          value={form.to_city}
                          onChange={handleChange}
                          placeholder="Destination city"
                        />
                      </Form.Group>
                    </>
                  )}

                  <Form.Group className="mb-3">
                    <Form.Label>Travel Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="travel_date"
                      value={form.travel_date}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  {travelType === "flight" && (
                    <Form.Group className="mb-3">
                      <Form.Label>Return Date</Form.Label>
                      <Form.Control
                        type="date"
                        name="return_date"
                        value={form.return_date}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  )}

                  <div className="form-section-title">
                    Additional Information
                  </div>

                  <Form.Group className="mb-3">
                    <Form.Label>Select Storehouse</Form.Label>
                    <Form.Select
                      name="storehouse_id"
                      value={form.storehouse_id}
                      onChange={handleChange}
                      required
                    >
                      <option value="">-- Choose Storehouse --</option>
                      {storehouses.map((s) => (
                        <option
                          key={s.id ?? s.storehouse_id}
                          value={s.id ?? s.storehouse_id}
                        >
                          {(s.name ?? s.storehouse_name) +
                            (s.location ? ` — ${s.location}` : "")}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>
                      Select{" "}
                      {travelType === "flight" ? "Flight" : "Hotel"}
                    </Form.Label>
                    <Form.Select
                      name="mock_item_id"
                      value={form.mock_item_id}
                      onChange={handleSelectOption}
                      required
                    >
                      <option value="">-- Choose an option --</option>
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
                      placeholder="Amount will auto-fill"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Purpose of Travel</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="purpose"
                      value={form.purpose}
                      onChange={handleChange}
                      placeholder="Enter purpose of travel"
                    />
                  </Form.Group>

                  <Button
                    type="submit"
                    className="submit-btn"
                    disabled={loading || walletLoading}
                  >
                    {loading ? "Processing..." : "🚀 Create Booking"}
                  </Button>
                </Form>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {walletLoading && (
        <div className="form-submit-loader">
          <dotlottie-wc
            src="https://lottie.host/25d6c398-cd85-4d7e-b742-29823092f08a/BO9V7489Yz.lottie"
            autoplay
            loop
          />
        </div>
      )}

      {loading && (
        <div className="form-submit-loader">
          <dotlottie-wc
            src="https://lottie.host/25d6c398-cd85-4d7e-b742-29823092f08a/BO9V7489Yz.lottie"
            autoplay
            loop
          />
        </div>
      )}

      {showSuccessAlert && (
        <div className="success-alert-overlay">
          <div className="success-alert-card">
            <div className="alert-icon">✅</div>
            <h4>Booking Successful!</h4>
            <p>Your travel booking has been created successfully.</p>
          </div>
        </div>
      )}
    </>
  );
}

export default BookingPage;
