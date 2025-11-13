import { useEffect, useState } from "react";
import { Container, Form, Button, Table, Alert } from "react-bootstrap";
import API from "../services/api";

function AddSubsidiary() {
  const [subsidiaries, setSubsidiaries] = useState([]);
  const [form, setForm] = useState({ name: "" });
  const [message, setMessage] = useState("");

  // Fetch subsidiaries
  const fetchSubsidiaries = async () => {
    try {
      const { data } = await API.get("/company/subsidiaries");
      setSubsidiaries(data);
    } catch (err) {
      console.error("Error fetching subsidiaries", err);
    }
  };

  useEffect(() => {
    fetchSubsidiaries();
  }, []);

  // Create subsidiary
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/company/create-subsidiary", { name: form.name });
      setMessage("✅ Subsidiary created successfully!");
      setForm({ name: "" });
      fetchSubsidiaries();
    } catch (err) {
      console.error("Error creating subsidiary", err);
      setMessage("❌ Error creating subsidiary");
    }
  };

  return (
    <Container className="mt-4">
      <h4 className="text-primary mb-3">Create Subsidiary</h4>
      {message && <Alert variant="info">{message}</Alert>}

      <Form onSubmit={handleSubmit} className="mb-3">
        <Form.Group className="mb-3">
          <Form.Label>Subsidiary Name</Form.Label>
          <Form.Control
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Enter subsidiary name"
            required
          />
        </Form.Group>
        <Button type="submit">Create</Button>
      </Form>

      <h5 className="mt-4">Existing Subsidiaries</h5>
      <Table bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
          </tr>
        </thead>
        <tbody>
          {subsidiaries.map((s) => (
            <tr key={s.id}>
              <td>{s.id}</td>
              <td>{s.name}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}

export default AddSubsidiary;
