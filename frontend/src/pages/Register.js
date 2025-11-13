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
    <Container className="d-flex justify-content-center align-items-center" style={{ height: "80vh" }}>
      <Card className="p-4 shadow" style={{ width: "450px" }}>
        <h3 className="text-center text-primary mb-3">Register User</h3>
        {message && <Alert variant="info">{message}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-2">
            <Form.Label>Name</Form.Label>
            <Form.Control name="name" value={formData.name} onChange={handleChange} required />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Email</Form.Label>
            <Form.Control name="email" type="email" value={formData.email} onChange={handleChange} required />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Password</Form.Label>
            <Form.Control name="password" type="password" value={formData.password} onChange={handleChange} required />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Role</Form.Label>
            <Form.Select name="role_id" value={formData.role_id} onChange={handleChange}>
              <option value="1">Super Admin</option>
              <option value="2">Company Admin</option>
              <option value="3">Manager</option>
              <option value="4">Employee</option>
              <option value="6">HR</option>
              <option value="7">SubsidiaryAdmin</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Select Subsidiary</Form.Label>
            <Form.Select name="subsidiary_id" value={formData.subsidiary_id} onChange={handleChange} required>
              <option value="">Select Subsidiary</option>
              {subsidiaries.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Manager ID (optional)</Form.Label>
            <Form.Control name="manager_id" value={formData.manager_id || ""} onChange={handleChange} />
          </Form.Group>

          <Button type="submit" className="w-100 btn btn-success mt-2">
            Register
          </Button>
        </Form>
      </Card>
    </Container>
  );
}

export default Register;
