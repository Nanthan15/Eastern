import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Table, Alert } from "react-bootstrap";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import API from "../services/api";

function ProfilePage() {
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userId = storedUser?.id;

  const [wallet, setWallet] = useState({ balance: 0 });
  const [transactions, setTransactions] = useState([]);
  const [message, setMessage] = useState("");


  // Fetch wallet
  const fetchWallet = async () => {
    try {
      const { data } = await API.get(`/wallet/employee/u/${userId}`);
      setWallet(data || { balance: 0 });
    } catch (err) {
      console.error("Error fetching wallet:", err);
      setMessage("Error fetching wallet balance");
    }
  };

  const roleLabels = {
  1: "Super Admin",
  2: "Company Admin",
  3: "Manager",
  4: "Employee",
  5: "Finance",
  6: "HR",
  7: "Subsidiary Admin"
  };
  
  const roleName = storedUser?.role_name || roleLabels[storedUser?.role_id] || "—";
  const companyName = storedUser?.company_name || "Main Company";

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      const { data } = await API.get(`/wallet/transactions`);
      // filter transactions related to this user
      const userTxns = data.filter(
        (tx) => tx.from_id === userId || tx.to_id === userId
      );
      setTransactions(userTxns);
    } catch (err) {
      console.error("Error fetching transactions:", err);
    }
  };

  useEffect(() => {
    fetchWallet();
    fetchTransactions();
    // eslint-disable-next-line
  }, []);

  // Prepare chart data
  const spent = transactions
    .filter((t) => t.description?.toLowerCase().includes("booking"))
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const available = Number(wallet.balance) - spent > 0 ? Number(wallet.balance) - spent : 0;

 const chartData = [
  { name: "Available", value: available > 0 ? available : 0.001 },
  { name: "Spent", value: spent > 0 ? spent : 0.001 },
];
  const COLORS = ["#28a745", "#dc3545"];

  return (
    <Container className="mt-4">
      <h4 className="text-primary mb-3">My Profile</h4>
      {message && <Alert variant="info">{message}</Alert>}

      <Row>
        {/* User Info */}
        <Col md={4}>
          <Card className="shadow-sm mb-4 p-3">
            <h5 className="text-secondary mb-3">User Information</h5>
            <p><strong>Name:</strong> {storedUser?.name}</p>
            <p><strong>Email:</strong> {storedUser?.email}</p>
            <p><strong>Role:</strong> {roleName}</p>
            <p><strong>Company:</strong> {companyName}</p>
          </Card>
        </Col>

        {/* Wallet Overview */}
        <Col md={8}>
          <Card className="shadow-sm mb-4 p-3">
            <h5 className="text-secondary mb-3">Wallet Overview</h5>
            <Row>
              <Col md={6}>
                <p><strong>Current Balance:</strong> ₹{wallet.balance}</p>
                <p><strong>Total Transactions:</strong> {transactions.length}</p>
              </Col>
              <Col md={6}>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      fill="#8884d8"
                      dataKey="value"
                      label
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Col>
            </Row>
          </Card>

          {/* Transaction History */}
          <Card className="shadow-sm p-3">
            <h5 className="text-secondary mb-3">Transaction History</h5>
            <Table bordered hover responsive>
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Amount (₹)</th>
                  <th>Description</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center text-muted">
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  transactions.map((t) => (
                    <tr key={t.id}>
                      <td>{t.id}</td>
                      <td>{t.from_level}</td>
                      <td>{t.to_level}</td>
                      <td>{t.amount}</td>
                      <td>{t.description}</td>
                      <td>{new Date(t.created_at).toLocaleDateString()}</td>
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

export default ProfilePage;
