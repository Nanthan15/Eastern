import { useState, useEffect } from "react";
import { Form, Button, Container, Card, Alert } from "react-bootstrap";
import API from "../services/api";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role_id: 4, // Default: Employee
    company_id: 1,
    subsidiary_id: "", // new field
    manager_id: null,
  });
  const [subsidiaries, setSubsidiaries] = useState([]);
  const [message, setMessage] = useState("");

  // 🔹 Fetch subsidiaries
  useEffect(() => {
    const fetchSubsidiaries = async () => {
      try {
        const { data } = await API.get("/company/subsidiaries");
        setSubsidiaries(data);
      } catch (err) {
        console.error("Error fetching subsidiaries:", err);
      }
    };
    fetchSubsidiaries();
  }, []);

  // 🔹 Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🔹 Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/auth/register", formData);
      setMessage("✅ User registered successfully!");
      setFormData({
        name: "",
        email: "",
        password: "",
        role_id: 4,
        company_id: 1,
        subsidiary_id: "",
        manager_id: null,
      });
    } catch (err) {
      console.error("Registration error:", err);
      setMessage("❌ Registration failed");
    }
  };

  return (
    <>
      <style>{`
        /* Card layout */
        .register-wrap {
          min-height: 80vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 12px;
          background: linear-gradient(180deg, rgba(13,71,161,0.04), rgba(0,188,212,0.02));
        }
        .register-card {
          width: 100%;
          max-width: 560px;
          border-radius: 14px;
          overflow: hidden;
          border: none;
          box-shadow: 0 18px 50px rgba(13,71,161,0.12);
        }
        .register-card .card-header {
          background: linear-gradient(90deg, #0D47A1 0%, #00BCD4 100%);
          color: white;
          padding: 20px 24px;
        }
        .register-card .card-header h3 {
          margin: 0;
          font-size: 20px;
          font-weight: 700;
          letter-spacing: 0.3px;
        }
        .register-card .card-body {
          background: #ffffff;
          padding: 22px;
        }

        /* Labels & inputs */
        .form-label-custom {
          font-weight: 700;
          color: #0D47A1;
          font-size: 13px;
          margin-bottom: 6px;
          display: block;
          text-transform: uppercase;
          letter-spacing: 0.6px;
        }
        .form-control-custom {
          border: 1.5px solid rgba(13,71,161,0.08) !important;
          border-radius: 10px;
          padding: 10px 12px !important;
          font-size: 14px;
          background: #FAFDFF;
          transition: box-shadow .18s ease, border-color .18s ease;
        }
        .form-control-custom:focus {
          border-color: #00BCD4 !important;
          box-shadow: 0 6px 20px rgba(0,188,212,0.08) !important;
          background: #fff !important;
          outline: none;
        }
        .form-select-custom {
          border: 1.5px solid rgba(13,71,161,0.08) !important;
          border-radius: 10px;
          padding: 10px 12px !important;
          font-size: 14px;
          background: #FAFDFF !important;
        }

        /* Info text */
        .register-note {
          font-size: 13px;
          color: #566;
          margin-bottom: 12px;
        }

        /* Action */
        .btn-register {
          width: 100%;
          background: linear-gradient(90deg, #0D47A1 0%, #00BCD4 100%);
          border: none;
          color: white;
          padding: 10px 14px;
          border-radius: 10px;
          font-weight: 700;
          box-shadow: 0 10px 30px rgba(13,71,161,0.14);
        }
        .btn-register:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        /* Message */
        .register-alert {
          border-left: 4px solid #00BCD4;
          background: rgba(0,188,212,0.06);
          color: #0D47A1;
          border-radius: 8px;
          padding: 10px 12px;
          margin-bottom: 12px;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .register-card { max-width: 92%; }
          .register-card .card-header h3 { font-size: 18px; }
        }
      `}</style>

      <div className="register-wrap">
        <Card className="register-card">
          <div className="card-header">
            <h3>Register New User</h3>
          </div>

          <div className="card-body">
            {message && <div className="register-alert">{message}</div>}

            <Form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label-custom">Full name</label>
                <Form.Control
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-control-custom"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label-custom">Email address</label>
                <Form.Control
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-control-custom"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label-custom">Password</label>
                <Form.Control
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-control-custom"
                  required
                />
              </div>

              <div className="row gx-2">
                <div className="col-12 col-md-6 mb-3">
                  <label className="form-label-custom">Role</label>
                  <Form.Select
                    name="role_id"
                    value={formData.role_id}
                    onChange={handleChange}
                    className="form-select-custom"
                  >
                    <option value="1">Super Admin</option>
                    <option value="2">Company Admin</option>
                    <option value="3">Manager</option>
                    <option value="4">Employee</option>
                    <option value="6">HR</option>
                    <option value="7">SubsidiaryAdmin</option>
                  </Form.Select>
                </div>

                <div className="col-12 col-md-6 mb-3">
                  <label className="form-label-custom">Select Subsidiary</label>
                  <Form.Select
                    name="subsidiary_id"
                    value={formData.subsidiary_id}
                    onChange={handleChange}
                    className="form-select-custom"
                    required
                  >
                    <option value="">Select Subsidiary</option>
                    {subsidiaries.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </Form.Select>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label-custom">Manager ID (optional)</label>
                <Form.Control
                  name="manager_id"
                  value={formData.manager_id || ""}
                  onChange={handleChange}
                  className="form-control-custom"
                />
              </div>

              <div className="d-grid mt-2">
                <Button type="submit" className="btn-register">
                  Register
                </Button>
              </div>
            </Form>
          </div>
        </Card>
      </div>
    </>
  );
}

export default Register;
