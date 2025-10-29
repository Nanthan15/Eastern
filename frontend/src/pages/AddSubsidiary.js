import { useEffect, useState } from "react";
import { Container, Form, Button, Table, Alert } from "react-bootstrap";
import API from "../services/api";

function AddSubsidiary() {
  const [subsidiaries, setSubsidiaries] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [form, setForm] = useState({ name: "", parent_company_id: "" });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/company/create-subsidiary", form);
      setMessage("Subsidiary created successfully!");
      setForm({ name: "", parent_company_id: "" });
      fetchSubsidiaries();
    } catch (err) {
      setMessage("Error creating subsidiary");
    }
  };

  const fetchSubsidiaries = async () => {
    try {
      const { data } = await API.get("/company/companies");
      const onlySubs = data.filter(c => c.parent_company_id !== null);
      setSubsidiaries(onlySubs);
    } catch (err) {
      console.error("Error fetching subsidiaries", err);
    }
  };

  useEffect(() => {
    fetchSubsidiaries();
  }, []);

  return (
    <Container className="mt-4">
      <h4 className="text-primary mb-3">Create Subsidiary Company</h4>

      {message && <Alert variant="info">{message}</Alert>}

      <Form onSubmit={handleSubmit} className="mb-3">
        <Form.Group className="mb-2">
          <Form.Label>Subsidiary Name</Form.Label>
          <Form.Control
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Enter subsidiary name"
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Parent Company</Form.Label>
          <Form.Select
            value={form.parent_company_id}
            onChange={(e) => setForm({ ...form, parent_company_id: e.target.value })}
            required
          >
            <option value="">Select Parent Company</option>
            {companies
              .filter((c) => c.parent_company_id === null)
              .map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
          </Form.Select>
        </Form.Group>

        <Button type="submit">Create</Button>
      </Form>

      <h5 className="mt-4">Existing Subsidiaries</h5>
      <Table bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Parent Company ID</th>
          </tr>
        </thead>
        <tbody>
          {subsidiaries.map((s) => (
            <tr key={s.id}>
              <td>{s.id}</td>
              <td>{s.name}</td>
              <td>{s.parent_company_id}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}

export default AddSubsidiary;
