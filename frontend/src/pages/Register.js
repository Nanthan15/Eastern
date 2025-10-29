import { useState, useEffect } from "react";
import { Form, Button, Container, Card, Alert } from "react-bootstrap";
import API from "../services/api";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role_id: 4, // Default: Employee
    company_id: "",
    manager_id: null,
  });
  const [companies, setCompanies] = useState([]);
  const [message, setMessage] = useState("");

  // 🔹 Fetch parent companies on load
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const { data } = await API.get("/company/companies");
        // Filter only parent companies (no parent_company_id)
        const parents = data.filter((c) => c.parent_company_id === null);
        setCompanies(parents);
      } catch (err) {
        console.error("Error fetching companies:", err);
      }
    };
    fetchCompanies();
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
        company_id: "",
        manager_id: null,
      });
    } catch (err) {
      setMessage("❌ Registration failed");
    }
  };

  return (
    <Container
      className="d-flex justify-content-center align-items-center"
      style={{ height: "80vh" }}
    >
      <Card className="p-4 shadow" style={{ width: "450px" }}>
        <h3 className="text-center text-primary mb-3">Register User</h3>
        {message && <Alert variant="info">{message}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-2">
            <Form.Label>Name</Form.Label>
            <Form.Control
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Email</Form.Label>
            <Form.Control
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Password</Form.Label>
            <Form.Control
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </Form.Group>

          {/* 🔹 Company Dropdown */}
          <Form.Group className="mb-2">
            <Form.Label>Select Company</Form.Label>
            <Form.Select
              name="company_id"
              value={formData.company_id}
              onChange={handleChange}
              required
            >
              <option value="">Select Parent Company</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Role ID (1=SuperAdmin, 2=CompanyAdmin, 3=SubsidiaryAdmin, 4=Employee)</Form.Label>
            <Form.Control
              name="role_id"
              value={formData.role_id}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Manager ID</Form.Label>
            <Form.Control
              name="manager_id"
              value={formData.manager_id || ""}
              onChange={handleChange}
            />
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
