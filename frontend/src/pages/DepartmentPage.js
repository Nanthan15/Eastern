import { useEffect, useState } from "react";
import { Container, Form, Button, Table, Alert } from "react-bootstrap";
import API from "../services/api";

function DepartmentPage() {
  const [companies, setCompanies] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({ company_id: "", name: "" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const { data } = await API.get("/company/companies");
        setCompanies(data);
      } catch (err) {
        console.error("Error fetching companies", err);
      }
    };
    fetchCompanies();
  }, []);

  const fetchDepartments = async (companyId) => {
    if (!companyId) return;
    try {
      const { data } = await API.get(`/department/list/${companyId}`);
      setDepartments(data);
    } catch (err) {
      console.error("Error fetching departments", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/department/create", form);
      setMessage("Department created successfully!");
      setForm({ ...form, name: "" });
      fetchDepartments(form.company_id);
    } catch (err) {
      setMessage("Error creating department");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this department?")) return;
    try {
      await API.delete(`/department/${id}`);
      fetchDepartments(form.company_id);
    } catch (err) {
      console.error("Error deleting department", err);
    }
  };

  return (
    <Container className="mt-4">
      <h4 className="text-primary mb-3">Department Management</h4>

      {message && <Alert variant="info">{message}</Alert>}

      <Form onSubmit={handleSubmit} className="mb-3">
        <Form.Group className="mb-3">
          <Form.Label>Select Company/Subsidiary</Form.Label>
          <Form.Select
            value={form.company_id}
            onChange={(e) => {
              const companyId = e.target.value;
              setForm({ ...form, company_id: companyId });
              fetchDepartments(companyId);
            }}
            required
          >
            <option value="">Select Company</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Department Name</Form.Label>
          <Form.Control
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Enter department name"
            required
          />
        </Form.Group>

        <Button type="submit">Add Department</Button>
      </Form>

      <h5 className="mt-4">Departments</h5>
      <Table bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Company ID</th>
            <th>Name</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {departments.map((d) => (
            <tr key={d.id}>
              <td>{d.id}</td>
              <td>{d.company_id}</td>
              <td>{d.name}</td>
              <td>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(d.id)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}

export default DepartmentPage;
