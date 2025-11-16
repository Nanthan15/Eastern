import { useState, useEffect, useRef } from "react";
import { Form, Button, Card, Alert } from "react-bootstrap";
import API from "../services/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const lottieRef = useRef(null);

  // try to reduce playback speed when loader is shown (safe guards)
  useEffect(() => {
    if (!loading) return;
    const el = lottieRef.current;
    if (!el) return;
    // small timeout to allow the component to initialize
    const t = setTimeout(() => {
      try {
        // reduce playback speed further for a much slower animation
        if ("playbackRate" in el) el.playbackRate = 0.15;
        if (typeof el.setPlaybackRate === "function") el.setPlaybackRate(0.15);
        if (el.player && typeof el.player.setSpeed === "function") el.player.setSpeed(0.15);
      } catch (e) {
        // ignore if API not available
      }
    }, 200);
    return () => clearTimeout(t);
  }, [loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // start full-page loader
    setMessage("");
    try {
      const { data } = await API.post("/auth/login", { email, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setMessage("✅ Login successful!");
      // keep loader visible a bit longer before redirect
      setTimeout(() => (window.location.href = "/dashboard"), 1000);
    } catch (err) {
      setMessage("❌ Invalid credentials");
      setLoading(false); // stop loader on error
    }
  };

  return (
    <>
      {/* small style block to control loader size & speed */}
      <style>{`
        /* slow pulse wrapper; the lottie playback is attempted to be slowed via ref */
        .loader-overlay { 
          position: fixed;
          top: 0; left: 0;
          width: 100vw; height: 100vh;
          /* translucent dark layer + backdrop blur to blur page behind */
          background: rgba(0,0,0,0.35);
          -webkit-backdrop-filter: blur(8px);
          backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center;
          z-index: 9999;
          pointer-events: auto; /* block interactions while loading */
          transition: background 250ms ease;
        }
        .loader-wrap {
          width: 560px; /* much bigger */
          height: 560px;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: gentlePulse 6s ease-in-out infinite; /* slower pulse */
          will-change: transform, opacity;
        }
        @keyframes gentlePulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.03); opacity: 0.97; }
          100% { transform: scale(1); opacity: 1; }
        }
        .loader-wrap dotlottie-wc {
          width: 100%;
          height: 100%;
        }

        /* Enhanced Login Form Styling - New Color Palette */
        .login-container {
          background: linear-gradient(135deg, #0D47A1 0%, #00BCD4 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
        }
        .login-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 60px;
          max-width: 1200px;
          width: 100%;
        }
        .login-left {
          flex: 1;
          min-width: 400px;
        }
        .login-right {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.8s ease-out 0.3s both;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .login-card {
          background: white;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(13, 71, 161, 0.15);
          padding: 50px !important;
          width: 100%;
          animation: slideUp 0.6s ease-out;
          border: 1px solid rgba(13, 71, 161, 0.05);
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .login-header {
          text-align: center;
          margin-bottom: 40px;
        }
        .login-header h3 {
          font-size: 32px;
          font-weight: 700;
          background: linear-gradient(135deg, #0D47A1 0%, #00BCD4 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0;
          margin-top: 15px;
        }
        .login-header-icon {
          font-size: 48px;
          margin-bottom: 10px;
        }
        .login-header p {
          color: #999;
          font-size: 14px;
          margin-top: 8px;
        }
        .form-group-enhanced {
          margin-bottom: 20px;
          position: relative;
        }
        .form-group-enhanced label {
          font-weight: 600;
          color: #333;
          margin-bottom: 10px;
          display: block;
          font-size: 14px;
          letter-spacing: 0.5px;
        }
        .form-control-enhanced {
          border: 2px solid #E3F2FD !important;
          border-radius: 10px;
          padding: 12px 16px !important;
          font-size: 15px;
          transition: all 0.3s ease;
          background: #F8FBFF;
        }
        .form-control-enhanced:focus {
          border-color: #00BCD4 !important;
          background: white !important;
          box-shadow: 0 0 0 3px rgba(0, 188, 212, 0.1) !important;
          outline: none;
        }
        .form-control-enhanced:disabled {
          background: #f0f0f0;
          cursor: not-allowed;
        }
        .login-btn {
          width: 100%;
          padding: 14px !important;
          font-size: 16px;
          font-weight: 600;
          border-radius: 10px;
          background: linear-gradient(135deg, #0D47A1 0%, #00BCD4 100%);
          border: none;
          color: white;
          margin-top: 10px;
          transition: all 0.3s ease;
          cursor: pointer;
          letter-spacing: 0.5px;
          box-shadow: 0 10px 25px rgba(13, 71, 161, 0.3);
        }
        .login-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 15px 35px rgba(0, 188, 212, 0.4);
        }
        .login-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .login-btn:disabled {
          opacity: 0.8;
          cursor: not-allowed;
        }
        .alert-enhanced {
          border-radius: 10px;
          border: none;
          padding: 14px 16px;
          margin-bottom: 20px;
          font-size: 14px;
          animation: slideDown 0.3s ease-out;
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .alert-info {
          background: rgba(0, 188, 212, 0.1);
          color: #0D47A1;
          border-left: 4px solid #00BCD4;
        }
        .lottie-decoration {
          width: 480px; /* increased size */
          height: 480px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent; /* transparent background */
          border-radius: 20px;
          backdrop-filter: none; /* remove blur */
          border: none; /* remove border */
        }
        .lottie-decoration dotlottie-wc {
          width: 100%;
          height: 100%;
          background: transparent !important; /* ensure transparent */
        }
        @media (max-width: 1024px) {
          .login-wrapper {
            flex-direction: column;
            gap: 30px;
          }
          .login-left {
            min-width: auto;
          }
          .lottie-decoration {
            width: 340px;
            height: 340px;
          }
        }
      `}</style>

      <div className="login-container" style={{ padding: 0, margin: 0 }}>
        <div className="login-wrapper">
          {/* Left Side - Login Form */}
          <div className="login-left">
            <Card className="login-card">
              <div className="login-header">
                <div className="login-header-icon">🔐</div>
                <h3>Welcome Back</h3>
                <p>Sign in to your account</p>
              </div>

              {message && <Alert className="alert-enhanced" variant="info">{message}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="form-group-enhanced">
                  <Form.Label>📧 Email Address</Form.Label>
                  <Form.Control
                    className="form-control-enhanced"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    disabled={loading}
                  />
                </Form.Group>

                <Form.Group className="form-group-enhanced">
                  <Form.Label>🔑 Password</Form.Label>
                  <Form.Control
                    className="form-control-enhanced"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    disabled={loading}
                  />
                </Form.Group>

                <Button type="submit" className="login-btn" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </Form>
            </Card>
          </div>

          {/* Right Side - Lottie Animation */}
          <div className="login-right">
            <div className="lottie-decoration">
              <dotlottie-wc
                src="https://lottie.host/a40b3055-57a4-476d-bb23-2ed437ddcb92/PAaF7T8kbM.lottie"
                speed="1"
                mode="forward"
                loop
                autoplay
                style={{ width: "100%", height: "100%", background: "transparent" }}
              />
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="loader-overlay">
          <div className="loader-wrap">
            <dotlottie-wc
              ref={lottieRef}
              src="https://lottie.host/cb407c0a-14e2-42f7-a824-ff9160ff6274/9f9yTVZ8RF.lottie"
              autoplay
              loop
            />
          </div>
        </div>
      )}
    </>
  );
}

export default Login;

