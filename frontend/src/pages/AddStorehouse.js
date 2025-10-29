import { useEffect, useState } from "react";
import { Container, Form, Button, Table, Alert } from "react-bootstrap";
import API from "../services/api";

function AddStorehouse() {
  const [companies, setCompanies] = useState([]);
  const [storehouses, setStorehouses] = useState([]);
  const [form, setForm] = useState({ company_id: "", name: "", location: "" });
  const [message, setMessage] = useState("");

  const fetchCompanies = async () => {
    const { data } = await API.get("/company/companies");
    setCompanies(data);
  };

  const fetchStorehouses = async (companyId) => {
    if (!companyId) return;
    const { data } = await API.get(`/storehouse/list/${companyId}`);
    setStorehouses(data);
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/storehouse/create", form);
      setMessage("Storehouse created successfully!");
      setForm({ ...form, name: "", location: "" });
      fetchStorehouses(form.company_id);
    } catch (err) {
      setMessage("Error creating storehouse");
    }
  };

  return (
    <Container className="mt-4">
      <h4 className="text-primary mb-3">Add Storehouse</h4>

      {message && <Alert variant="info">{message}</Alert>}

      <Form onSubmit={handleSubmit} className="mb-3">
        <Form.Group className="mb-3">
          <Form.Label>Select Company</Form.Label>
          <Form.Select
            value={form.company_id}
            onChange={(e) => {
              setForm({ ...form, company_id: e.target.value });
              fetchStorehouses(e.target.value);
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

        <Form.Group className="mb-2">
          <Form.Label>Storehouse Name</Form.Label>
          <Form.Control
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Enter storehouse name"
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Location</Form.Label>
          <Form.Control
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="Enter storehouse location"
          />
        </Form.Group>

        <Button type="submit">Add Storehouse</Button>
      </Form>

      <h5 className="mt-4">Storehouses</h5>
      <Table bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Company ID</th>
            <th>Name</th>
            <th>Location</th>
          </tr>
        </thead>
        <tbody>
          {storehouses.map((s) => (
            <tr key={s.storehouse_id}>
              <td>{s.id}</td>
              <td>{s.company_id}</td>
              <td>{s.name}</td>
              <td>{s.location}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}

export default AddStorehouse;
