// frontend/src/pages/BookingPage.js
import { useEffect, useState } from "react";
import { Container, Form, Button, Alert, Row, Col, InputGroup } from "react-bootstrap";
import API from "../services/api";

function BookingPage() {
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userId = storedUser?.id;
  const companyId = storedUser?.company_id;

  const [walletBalance, setWalletBalance] = useState(0);
  const [travelType, setTravelType] = useState("flight");
  const [tripType, setTripType] = useState("oneway"); // for flights
  const [options, setOptions] = useState([]);
  const [storehouses, setStorehouses] = useState([]);
  const [form, setForm] = useState({
    storehouse_id: "",
    mock_item_id: "",
    from_city: "",
    to_city: "",
    travel_date: "",
    return_date: "",
    check_in: "",
    check_out: "",
    purpose: "",
    total_amount: "",
  });
  const [itinerary, setItinerary] = useState([
    { from_city: "", to_city: "", date: "" },
  ]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [walletLoading, setWalletLoading] = useState(true);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  // derived remaining balance after entering amount
  const remainingBalance = (() => {
    const amt = Number(form.total_amount || 0);
    if (!walletBalance && walletBalance !== 0) return null;
    return Number(walletBalance) - amt;
  })();

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

  const fetchOptions = async (type) => {
    try {
      const { data } = await API.get(`/booking/options?type=${type}`);
      setOptions(data);
    } catch (err) {
      console.error("Error fetching mock options:", err);
    }
  };

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
        from_city: selected.from_city || f.from_city,
        to_city: selected.to_city || f.to_city,
        total_amount: selected.price || f.total_amount,
      }));
    }
    if (selected && travelType === "hotel") {
      setForm((f) => ({
        ...f,
        // hotel city
        to_city: selected.city || f.to_city,
        total_amount: selected.price_per_night || f.total_amount,
      }));
    }
  };

  // itinerary handlers for multicity
  const handleItineraryChange = (index, field, value) => {
    const copy = [...itinerary];
    copy[index][field] = value;
    setItinerary(copy);
  };
  const addItineraryLeg = () => setItinerary([...itinerary, { from_city: "", to_city: "", date: "" }]);
  const removeItineraryLeg = (idx) => setItinerary(itinerary.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      // validation
      if (!form.storehouse_id) {
        setMessage("Please select a storehouse");
        setLoading(false);
        return;
      }
      if (!form.mock_item_id) {
        setMessage("Please select an option (flight/hotel)");
        setLoading(false);
        return;
      }

      // check wallet
      if (Number(form.total_amount) > Number(walletBalance)) {
        setMessage("❌ Insufficient balance in your wallet!");
        setLoading(false);
        return;
      }

      const payload = {
        user_id: userId,
        company_id: companyId,
        storehouse_id: form.storehouse_id,
        travel_type: travelType,
        mock_item_id: form.mock_item_id,
        purpose: form.purpose || null,
        total_amount: Number(form.total_amount) || 0,
      };

      if (travelType === "flight") {
        payload.trip_type = tripType;
        if (tripType === "oneway") {
          if (!form.travel_date) {
            setMessage("Please pick travel date for one-way flight");
            setLoading(false);
            return;
          }
          payload.travel_date = form.travel_date;
          payload.from_city = form.from_city || null;
          payload.to_city = form.to_city || null;
        } else if (tripType === "roundtrip") {
          if (!form.travel_date || !form.return_date) {
            setMessage("Please pick both travel date and return date for round-trip");
            setLoading(false);
            return;
          }
          payload.travel_date = form.travel_date;
          payload.return_date = form.return_date;
          payload.from_city = form.from_city || null;
          payload.to_city = form.to_city || null;
        } else if (tripType === "multicity") {
          // validate itinerary
          if (!Array.isArray(itinerary) || itinerary.length < 1) {
            setMessage("Add at least one itinerary leg");
            setLoading(false);
            return;
          }
          for (const leg of itinerary) {
            if (!leg.from_city || !leg.to_city || !leg.date) {
              setMessage("Each itinerary leg needs from, to and date");
              setLoading(false);
              return;
            }
          }
          payload.itinerary = itinerary;
        }
      } else if (travelType === "hotel") {
        if (!form.check_in || !form.check_out) {
          setMessage("Please pick check-in and check-out dates");
          setLoading(false);
          return;
        }
        payload.check_in = form.check_in;
        payload.check_out = form.check_out;
        payload.to_city = form.to_city || null;
      }

      // convert empty strings to null (defensive)
      for (const k of Object.keys(payload)) {
        if (payload[k] === "") payload[k] = null;
      }

      await API.post("/booking/create", payload);

      setMessage("✅ Booking created successfully!");
      setShowSuccessAlert(true);
      // reset form
      setForm({
        storehouse_id: "",
        mock_item_id: "",
        from_city: "",
        to_city: "",
        travel_date: "",
        return_date: "",
        check_in: "",
        check_out: "",
        purpose: "",
        total_amount: "",
      });
      setItinerary([{ from_city: "", to_city: "", date: "" }]);
      setTimeout(() => setShowSuccessAlert(false), 3000);
      fetchWallet();
    } catch (err) {
      console.error("Create booking error:", err);
      const errMsg = err?.response?.data?.message || "Failed to create booking";
      setMessage(`❌ ${errMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        /* page */
        .booking-container {
          background: linear-gradient(180deg, #f7fbff 0%, #eef6ff 100%);
          min-height: 100vh;
          padding: 36px 18px;
          color: #0D47A1;
        }
        .booking-header {
          text-align: center;
          margin-bottom: 28px;
        }
        .booking-header-icon { font-size:46px; display:inline-block; margin-right:10px; vertical-align:middle; }
        .booking-header h2 {
          display: inline-block;
          font-size: 30px;
          font-weight: 700;
          margin: 0;
          vertical-align: middle;
          background: linear-gradient(135deg,#0D47A1 0%,#00BCD4 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .booking-header p { color: #556; margin-top:8px; }

        /* wallet (centered content) */
        .wallet-card {
          background: linear-gradient(90deg, rgba(13,71,161,0.95), rgba(0,188,212,0.9));
          color: #fff;
          border-radius: 12px;
          padding: 18px;
          box-shadow: 0 12px 32px rgba(13,71,161,0.12);
          margin-bottom: 22px;

          /* center content vertically/horizontally */
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }
        .wallet-card .label { font-size:12px; text-transform:uppercase; opacity:0.95; letter-spacing:0.6px; }
        .wallet-card .amount { font-size:24px; font-weight:700; margin-top:6px; }
        .wallet-card .small-note { font-size:12px; opacity:0.9; margin-top:6px; }

        /* form card */
        .booking-form-card {
          background: #fff;
          border-radius: 12px;
          padding: 22px;
          box-shadow: 0 8px 28px rgba(13,71,161,0.06);
          border: 1px solid rgba(13,71,161,0.04);
        }
        .booking-form-card h5 { color:#0D47A1; font-weight:700; margin-bottom:18px; font-size:18px; }
        .form-section-title {
          color: #0D47A1;
          font-weight:600;
          font-size:13px;
          text-transform:uppercase;
          letter-spacing:0.6px;
          margin: 16px 0 10px;
          border-bottom: 2px solid rgba(0,188,212,0.08);
          padding-bottom:8px;
        }
        .form-control, .form-select {
          border-radius:8px;
          border:1.5px solid rgba(13,71,161,0.08);
          padding:8px 12px;
          background:#fbfeff;
        }
        .form-control:focus, .form-select:focus {
          border-color:#00BCD4;
          box-shadow:0 8px 20px rgba(0,188,212,0.06);
        }
        .submit-btn {
          background: linear-gradient(90deg,#0D47A1 0%,#00BCD4 100%);
          border: none;
          color: white;
          padding: 10px 14px;
          border-radius: 8px;
          font-weight:700;
          width:100%;
          box-shadow: 0 10px 28px rgba(13,71,161,0.15);
        }
        .submit-btn:disabled { opacity:0.8; cursor:not-allowed; }

        .amount-help {
          font-size:13px;
          margin-top:8px;
          color:#0D47A1;
          display:flex;
          justify-content:space-between;
          align-items:center;
        }
        .amount-help .warning { color:#c62828; font-weight:600; }

        /* full page loader (keeps parity with StatusPage) */
        .full-page-loader {
          position: fixed; inset:0;
          background: rgba(0,0,0,0.22);
          -webkit-backdrop-filter: blur(4px); backdrop-filter: blur(4px);
          display:flex; align-items:center; justify-content:center; z-index:9999;
        }
        .full-page-loader dotlottie-wc { width: 340px; height: 340px; }

        /* success overlay */
        .success-alert-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.36); display:flex; align-items:center; justify-content:center; z-index:10000; }
        .success-alert-card { background:#fff; padding:32px; border-radius:12px; box-shadow:0 20px 60px rgba(13,71,161,0.15); text-align:center; max-width:520px; }

        @media (max-width: 992px) {
          .booking-header h2 { font-size:24px; }
          .lottie-decoration { display:none; }
          .booking-container { padding:22px 12px; }
        }
      `}</style>

      <div className="booking-container">
        <Container>
          <div className="booking-header">
            <span className="booking-header-icon">✈️</span>
            <h2>Book Your Travel</h2>
            <p>Plan your journey with ease</p>
          </div>

          <Row>
            <Col lg={8} className="mx-auto">
              {!walletLoading && (
                <div className="wallet-card" role="status" aria-live="polite">
                  <div>
                    <div className="label">💰 Available Wallet Balance</div>
                    <div className="amount">
                      ₹{Number(walletBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="small-note">Wallet balance will be used for bookings</div>
                  </div>
                </div>
              )}

              {message && !showSuccessAlert && (
                <Alert className={`alert-custom ${message.includes("✅") ? "alert-success-custom" : "alert-danger-custom"}`}>
                  {message}
                </Alert>
              )}

              <div className="booking-form-card">
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Travel Type</Form.Label>
                    <Form.Select value={travelType} onChange={(e) => { setTravelType(e.target.value); setTripType("oneway"); }}>
                      <option value="flight">✈️ Flight</option>
                      <option value="hotel">🏨 Hotel</option>
                    </Form.Select>
                  </Form.Group>

                  {travelType === "flight" && (
                    <>
                      <Form.Group className="mb-3">
                        <Form.Label>Trip Type</Form.Label>
                        <Form.Select value={tripType} onChange={(e) => setTripType(e.target.value)}>
                          <option value="oneway">One-way</option>
                          <option value="roundtrip">Round-trip</option>
                          <option value="multicity">Multi-city</option>
                        </Form.Select>
                      </Form.Group>

                      {tripType !== "multicity" && (
                        <>
                          <Form.Group className="mb-3">
                            <Form.Label>From City</Form.Label>
                            <Form.Control name="from_city" value={form.from_city} onChange={handleChange} />
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Label>To City</Form.Label>
                            <Form.Control name="to_city" value={form.to_city} onChange={handleChange} />
                          </Form.Group>
                        </>
                      )}

                      {tripType === "oneway" && (
                        <Form.Group className="mb-3">
                          <Form.Label>Travel Date</Form.Label>
                          <Form.Control type="date" name="travel_date" value={form.travel_date} onChange={handleChange} required />
                        </Form.Group>
                      )}

                      {tripType === "roundtrip" && (
                        <>
                          <Form.Group className="mb-3">
                            <Form.Label>Travel Date</Form.Label>
                            <Form.Control type="date" name="travel_date" value={form.travel_date} onChange={handleChange} required />
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Label>Return Date</Form.Label>
                            <Form.Control type="date" name="return_date" value={form.return_date} onChange={handleChange} required />
                          </Form.Group>
                        </>
                      )}

                      {tripType === "multicity" && (
                        <>
                          <div className="form-section-title">Itinerary</div>
                          {itinerary.map((leg, idx) => (
                            <div key={idx} style={{ marginBottom: 10, borderRadius: 8, padding: 10, background: "#f7fbff" }}>
                              <Row>
                                <Col md={4}>
                                  <Form.Control placeholder="From city" value={leg.from_city} onChange={(e) => handleItineraryChange(idx, "from_city", e.target.value)} />
                                </Col>
                                <Col md={4}>
                                  <Form.Control placeholder="To city" value={leg.to_city} onChange={(e) => handleItineraryChange(idx, "to_city", e.target.value)} />
                                </Col>
                                <Col md={3}>
                                  <Form.Control type="date" value={leg.date} onChange={(e) => handleItineraryChange(idx, "date", e.target.value)} />
                                </Col>
                                <Col md={1}>
                                  {idx === 0 ? (
                                    <Button variant="link" onClick={addItineraryLeg}>＋</Button>
                                  ) : (
                                    <Button variant="link" onClick={() => removeItineraryLeg(idx)}>✖</Button>
                                  )}
                                </Col>
                              </Row>
                            </div>
                          ))}
                        </>
                      )}
                    </>
                  )}

                  {travelType === "hotel" && (
                    <>
                      <Form.Group className="mb-3">
                        <Form.Label>Hotel City</Form.Label>
                        <Form.Control name="to_city" value={form.to_city} onChange={handleChange} />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Check-in</Form.Label>
                        <Form.Control type="date" name="check_in" value={form.check_in} onChange={handleChange} required />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Check-out</Form.Label>
                        <Form.Control type="date" name="check_out" value={form.check_out} onChange={handleChange} required />
                      </Form.Group>
                    </>
                  )}

                  <div className="form-section-title">Additional</div>

                  <Form.Group className="mb-3">
                    <Form.Label>Select Storehouse</Form.Label>
                    <Form.Select name="storehouse_id" value={form.storehouse_id} onChange={handleChange} required>
                      <option value="">-- Choose Storehouse --</option>
                      {storehouses.map((s) => (
                        <option key={s.id ?? s.storehouse_id} value={s.id ?? s.storehouse_id}>
                          {(s.name ?? s.storehouse_name) + (s.location ? ` — ${s.location}` : "")}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Select {travelType === "flight" ? "Flight" : "Hotel"}</Form.Label>
                    <Form.Select name="mock_item_id" value={form.mock_item_id} onChange={handleSelectOption} required>
                      <option value="">-- Choose an option --</option>
                      {options.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {travelType === "flight"
                            ? `${opt.from_city || ""} → ${opt.to_city || ""} (${opt.airline || ""}) - ₹${opt.price}`
                            : `${opt.hotel_name} (${opt.city}) - ₹${opt.price_per_night}`}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Total Amount (INR)</Form.Label>
                    <InputGroup>
                      <InputGroup.Text style={{ background: "transparent", borderRight: "none", color: "#0D47A1" }}>₹</InputGroup.Text>
                      <Form.Control
                        name="total_amount"
                        value={form.total_amount}
                        onChange={handleChange}
                        placeholder="Amount will auto-fill"
                        required
                      />
                    </InputGroup>
                    <div className="amount-help">
                      <div>Estimated charge</div>
                      <div>
                        {remainingBalance === null
                          ? "Wallet not loaded"
                          : remainingBalance < 0
                          ? <span className="warning">Insufficient (after booking: ₹{(remainingBalance).toLocaleString()})</span>
                          : <span>After booking: ₹{remainingBalance.toLocaleString()}</span>
                        }
                      </div>
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Purpose of Travel</Form.Label>
                    <Form.Control as="textarea" rows={3} name="purpose" value={form.purpose} onChange={handleChange} placeholder="Enter purpose of travel" />
                  </Form.Group>

                  <Button type="submit" className="submit-btn" disabled={loading || walletLoading}>
                    {loading ? "Processing..." : "🚀 Create Booking"}
                  </Button>
                </Form>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Full-page Lottie loader: show while wallet is loading or form submission is in progress */}
      {(walletLoading || loading) && (
        <div className="full-page-loader" role="status" aria-live="polite">
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
