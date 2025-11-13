import { useEffect, useState } from "react";
import { Container, Row, Col, Table, Form, Button, Alert, Card } from "react-bootstrap";
import API from "../services/api";

function CompanyWalletPage() {
  const [mainWallet, setMainWallet] = useState(null);
  const [subsidiaries, setSubsidiaries] = useState([]);
  const [allocations, setAllocations] = useState({ company_id: "", amount: "" });
  const [message, setMessage] = useState("");

  // Fetch main wallet
  const fetchMainWallet = async () => {
    try {
      const { data } = await API.get("/wallet/main");
      setMainWallet(data);
    } catch (err) {
      console.error("Error fetching main wallet:", err);
    }
  };

  // Fetch subsidiaries (companies with parent_company_id = 1)
  const fetchSubsidiaries = async () => {
    try {
      const { data } = await API.get("/company/subsidiaries");
       // your company list API
      
      console.log("Subsidiaries fetched:", data); 
      setSubsidiaries(data);
    } catch (err) {
      console.error("Error fetching subsidiaries:", err);
    }
  };

  // Allocate funds
  const handleAllocate = async (e) => {
    e.preventDefault();
    if (!allocations.company_id || !allocations.amount) {
      setMessage("⚠️ Please select a subsidiary and enter an amount.");
      return;
    }

    try {
      await API.post("/wallet/allocate-to-company", allocations);
      setMessage("✅ Funds allocated successfully!");
      setAllocations({ company_id: "", amount: "" });
      fetchMainWallet();
    } catch (err) {
      console.error("Error allocating funds:", err);
      setMessage("❌ Failed to allocate funds");
    }
  };

  useEffect(() => {
    fetchMainWallet();
    fetchSubsidiaries();
  }, []);

  return (
    <Container className="mt-4">
      <h4 className="text-primary mb-3">Company Wallet Management</h4>
      {message && <Alert variant="info">{message}</Alert>}

      <Row>
        <Col md={6}>
          <Card className="p-3 shadow-sm mb-3">
            <h5 className="text-secondary">Main Wallet</h5>
            {mainWallet ? (
              <div>
                <p>Total Balance: ₹{mainWallet.total_balance}</p>
                <p>Allocated Balance: ₹{mainWallet.allocated_balance}</p>
                <p>
                  Available: ₹
                  {Number(mainWallet.total_balance) - Number(mainWallet.allocated_balance)}
                </p>
              </div>
            ) : (
              <p>Loading...</p>
            )}
          </Card>

          <Card className="p-3 shadow-sm">
            <h5 className="text-secondary mb-3">Allocate to Subsidiary</h5>
            <Form onSubmit={handleAllocate}>
              <Form.Group className="mb-3">
                <Form.Label>Select Subsidiary</Form.Label>
                <Form.Select
                  value={allocations.company_id}
                  onChange={(e) =>
                    setAllocations({ ...allocations, company_id: e.target.value })
                  }
                >
                  <option value="">Select Subsidiary</option>
                  {subsidiaries.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Amount (INR)</Form.Label>
                <Form.Control
                  type="number"
                  value={allocations.amount}
                  onChange={(e) =>
                    setAllocations({ ...allocations, amount: e.target.value })
                  }
                />
              </Form.Group>
              <Button type="submit" variant="primary" className="w-100">
                Allocate Funds
              </Button>
            </Form>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="p-3 shadow-sm">
            <h5 className="text-secondary mb-3">Subsidiary Wallets</h5>
            <Table bordered hover>
              <thead className="table-light">
                <tr>
                  <th>Subsidiary</th>
                  <th>Allocated</th>
                  <th>Used</th>
                  <th>Available</th>
                </tr>
              </thead>
              <tbody>
                {subsidiaries.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="text-center text-muted">
                      No subsidiaries found
                    </td>
                  </tr>
                ) : (
                  subsidiaries.map((s) => (
                    <tr key={s.id}>
                      <td>{s.name}</td>
                      <td>₹{s.allocated_amount || 0}</td>
                      <td>₹{s.used_amount || 0}</td>
                      <td>₹{s.available_balance || 0}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default CompanyWalletPage;
