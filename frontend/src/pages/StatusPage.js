// src/pages/StatusPage.js
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

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const startTime = Date.now();
      const { data } = await API.get(`/booking/list/${userId}`);
      const elapsedTime = Date.now() - startTime;
      const minLoadTime = 2500;
      if (elapsedTime < minLoadTime) {
        await new Promise((resolve) =>
          setTimeout(resolve, minLoadTime - elapsedTime)
        );
      }
      console.log("Fetched bookings (sample):", data?.slice?.(0, 6) ?? data);
      setBookings(data || []);
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

  // -------------------------
  // Normalizer: produce a consistent itinerary object
  // -------------------------
  const normalizeItinerary = (booking) => {
    // If booking.itinerary already present and object -> use it (but standardize keys)
    if (booking.itinerary && typeof booking.itinerary === "object") {
      // shore up segments if present
      if (Array.isArray(booking.itinerary.segments)) {
        const segs = booking.itinerary.segments.map(normalizeSegment);
        return { ...booking.itinerary, segments: segs };
      }
      return booking.itinerary;
    }

    // If itinerary is JSON string -> parse
    if (booking.itinerary && typeof booking.itinerary === "string") {
      try {
        const parsed = JSON.parse(booking.itinerary);
        if (parsed && typeof parsed === "object") {
          if (Array.isArray(parsed.segments)) {
            parsed.segments = parsed.segments.map(normalizeSegment);
          }
          return parsed;
        }
      } catch (e) {
        console.warn("Failed to parse booking.itinerary JSON string", booking.id);
      }
    }

    // If there is a top-level segments field (stringified or array)
    if (booking.segments) {
      if (typeof booking.segments === "string") {
        try {
          const s = JSON.parse(booking.segments);
          if (Array.isArray(s)) {
            return { type: "flight", trip_mode: "multicity", segments: s.map(normalizeSegment) };
          }
        } catch (e) {
          // ignore
        }
      } else if (Array.isArray(booking.segments)) {
        return { type: "flight", trip_mode: "multicity", segments: booking.segments.map(normalizeSegment) };
      }
    }

    // Legacy fallback
    const type = booking.travel_type || (booking.hotel_name ? "hotel" : "flight");

    if (type === "hotel") {
      const check_in = booking.check_in || booking.travel_date || null;
      const check_out = booking.check_out || booking.return_date || null;
      return {
        type: "hotel",
        trip_mode: "N/A",
        city: booking.to_city || booking.city || booking.storehouse_name || null,
        check_in,
        check_out,
      };
    }

    // Flights fallback: detect round trip by presence of a return_date (or return_date field)
    const travel_date = booking.travel_date || null;
    const return_date = booking.return_date || null;
    const trip_mode = return_date ? "round_trip" : "one_way";

    return {
      type: "flight",
      trip_mode,
      from_city: booking.from_city || booking.departure || null,
      to_city: booking.to_city || booking.destination || null,
      travel_date,
      return_date,
    };
  };

  // Normalize a single segment object: accept many shapes, trim strings
  function normalizeSegment(seg) {
    if (!seg || typeof seg !== "object") return { from: "-", to: "-", date: null };

    const fromRaw =
      seg.from ||
      seg.from_city ||
      seg.origin ||
      seg.departure ||
      seg.fromCity ||
      seg.start ||
      null;
    const toRaw =
      seg.to ||
      seg.to_city ||
      seg.dest ||
      seg.arrival ||
      seg.toCity ||
      seg.end ||
      null;
    const dateRaw = seg.date || seg.travel_date || seg.dt || seg.segment_date || null;

    const safeTrim = (v) => {
      if (v === null || v === undefined) return null;
      if (typeof v !== "string") return String(v);
      return v.trim();
    };

    return {
      from: safeTrim(fromRaw) || "-",
      to: safeTrim(toRaw) || "-",
      date: dateRaw ? String(dateRaw).trim() : null,
    };
  }

  // -------------------------
  // Render helpers
  // -------------------------
  const routeTextFromIt = (it, booking) => {
    if (!it) return "-";

    if (it.type === "hotel") {
      return it.city || "-";
    }

    // flight
    if ((it.trip_mode === "multicity" || it.trip_mode === "multi_city") && Array.isArray(it.segments)) {
      const segs = it.segments.map((seg) => {
        // seg may not be normalized, but our normalizeSegment tries to standardize
        const from = (seg.from || seg.from_city || seg.origin || "-").toString().trim();
        const to = (seg.to || seg.to_city || seg.dest || seg.arrival || "-").toString().trim();
        return `${from} → ${to}`;
      });
      // if all segments are blank, fallback to booking.from_city / booking.to_city
      const hasNonEmpty = segs.some(s => s && s !== " → -");
      if (!hasNonEmpty && (booking?.from_city || booking?.to_city)) {
        return `${booking.from_city || "-"} → ${booking.to_city || "-"}`;
      }
      return segs.length ? segs.join(", ") : "-";
    }

    // simple from->to
    const f = it.from_city || it.from || it.origin || booking?.from_city || "-";
    const t = it.to_city || it.to || it.destination || booking?.to_city || "-";
    return `${(String(f)).trim()} → ${(String(t)).trim()}`;
  };

  const travelDateFromIt = (it) => {
    if (!it) return "-";
    if (it.type === "hotel") {
      const ci = it.check_in || "-";
      const co = it.check_out || "-";
      return `${ci || "-"} → ${co || "-"}`;
    }

    if (it.trip_mode === "round_trip") {
      return `${it.travel_date || "-"} → ${it.return_date || "-"}`;
    }

    if ((it.trip_mode === "multicity" || it.trip_mode === "multi_city") && Array.isArray(it.segments)) {
      const dates = it.segments
        .map((seg) => seg.date || seg.travel_date || null)
        .filter(Boolean)
        .map(d => ("" + d).trim());
      return dates.length ? dates.join(", ") : (it.travel_date || "-");
    }

    return it.travel_date || "-";
  };

  // -------------------------
  // Render component
  // -------------------------
  return (
    <>
      <style>{`
        .status-container { background: linear-gradient(135deg,#f5f7fa 0%,#e8eef5 100%); min-height:100vh; padding:40px 20px; }
        .status-header { text-align:center; margin-bottom:40px; }
        .status-header-icon { font-size:46px; margin-right:10px; }
        .status-header h2 { background: linear-gradient(135deg,#0D47A1 0%,#00BCD4 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; font-weight:700; font-size:36px; }
        .bookings-card { background:white; border-radius:15px; padding:30px; box-shadow:0 5px 20px rgba(13,71,161,0.08); border:1px solid rgba(0,188,212,0.1); }
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
                      <th>Trip Mode</th>
                      <th>Route</th>
                      <th>Travel Date</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => {
                      const it = normalizeItinerary(booking);

                      // debug log for tricky bookings (helpful during backend integration)
                      if (!it) {
                        console.warn("Booking missing itinerary data:", booking.id, booking);
                      }

                      const routeText = routeTextFromIt(it, booking);
                      const dateText = travelDateFromIt(it);
                      const tripMode = it.trip_mode || (it.type === "hotel" ? "N/A" : "one_way");

                      return (
                        <tr key={booking.id}>
                          <td className="ref-no">{booking.reference_no}</td>
                          <td className="travel-type">{getTravelIcon(booking.travel_type)} {booking.travel_type}</td>
                          <td>{tripMode}</td>
                          <td className="city-route">{routeText}</td>
                          <td>{dateText}</td>
                          <td><strong>₹{Number(booking.total_amount || 0).toLocaleString()}</strong></td>
                          <td><Badge bg={getStatusBadge(booking.status)}>{booking.status || "pending"}</Badge></td>
                        </tr>
                      );
                    })}
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
