import { useEffect, useState } from "react";
import { Container, Row, Col, Table, Form, Button, Alert, Card } from "react-bootstrap";
import API from "../services/api";

function SubsidiaryWalletPage() {
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const subsidiaryId = storedUser?.subsidiary_id;

  const [subsidiaryWallet, setSubsidiaryWallet] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [allocations, setAllocations] = useState({ employee_id: "", amount: "" });
  const [message, setMessage] = useState("");

  // Fetch subsidiary wallet
  const fetchSubsidiaryWallet = async () => {
    try {
      const { data } = await API.get(`/wallet/company/${subsidiaryId}`);
      setSubsidiaryWallet(data);
    } catch (err) {
      console.error("Error fetching subsidiary wallet:", err);
    }
  };

  // Fetch employees for this subsidiary
  const fetchEmployees = async () => {
    try {
      const { data } = await API.get(`/employee/subsidiary/${subsidiaryId}`);
      setEmployees(data);
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  // Allocate funds to employee
  const handleAllocate = async (e) => {
    e.preventDefault();
    if (!allocations.employee_id || !allocations.amount) {
      setMessage("⚠️ Please select an employee and enter an amount.");
      return;
    }

    try {
      await API.post("/wallet/allocate-to-employee", {
        employee_id: allocations.employee_id,
        company_id: subsidiaryId, // ✅ Use subsidiary ID
        amount: allocations.amount,
      });
      setMessage("✅ Funds allocated successfully!");
      setAllocations({ employee_id: "", amount: "" });
      fetchSubsidiaryWallet();
    } catch (err) {
      console.error("Error allocating funds:", err);
      setMessage("❌ Failed to allocate funds");
    }
  };

  useEffect(() => {
    fetchSubsidiaryWallet();
    fetchEmployees();
    // eslint-disable-next-line
  }, []);

  return (
    <Container className="mt-4">
      <h4 className="text-primary mb-3">Subsidiary Wallet Management</h4>
      {message && <Alert variant="info">{message}</Alert>}

      <Row>
        <Col md={6}>
          <Card className="p-3 shadow-sm mb-3">
            <h5 className="text-secondary">Subsidiary Wallet</h5>
            {subsidiaryWallet ? (
              <div>
                <p>Allocated Amount: ₹{subsidiaryWallet.allocated_amount}</p>
                <p>Used Amount: ₹{subsidiaryWallet.used_amount}</p>
                <p>
                  Available Balance: ₹
                  {Number(subsidiaryWallet.allocated_amount) -
                    Number(subsidiaryWallet.used_amount)}
                </p>
              </div>
            ) : (
              <p>Loading...</p>
            )}
          </Card>

          <Card className="p-3 shadow-sm">
            <h5 className="text-secondary mb-3">Allocate Funds to Employee</h5>
            <Form onSubmit={handleAllocate}>
              <Form.Group className="mb-3">
                <Form.Label>Select Employee</Form.Label>
                <Form.Select
                  value={allocations.employee_id}
                  onChange={(e) =>
                    setAllocations({ ...allocations, employee_id: e.target.value })
                  }
                >
                  <option value="">Select Employee</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.email})
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
            <h5 className="text-secondary mb-3">Employee Wallets</h5>
            <Table bordered hover>
              <thead className="table-light">
                <tr>
                  <th>Employee</th>
                  <th>Balance</th>
                </tr>
              </thead>
              <tbody>
                {employees.length === 0 ? (
                  <tr>
                    <td colSpan="2" className="text-center text-muted">
                      No employees found
                    </td>
                  </tr>
                ) : (
                  employees.map((emp) => (
                    <tr key={emp.id}>
                      <td>{emp.name}</td>
                      <td>₹{emp.balance || 0}</td>
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

export default SubsidiaryWalletPage;
