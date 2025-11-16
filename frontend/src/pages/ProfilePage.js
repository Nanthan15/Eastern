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
    <>
      <style>{`
        .profile-container {
          background: linear-gradient(135deg, #f5f7fa 0%, #e8eef5 100%);
          min-height: 100vh;
          padding: 40px 20px;
        }
        .profile-header {
          text-align: center;
          margin-bottom: 40px;
        }
        .profile-header h2 {
          background: linear-gradient(135deg, #0D47A1 0%, #00BCD4 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 700;
          font-size: 36px;
          margin-bottom: 10px;
        }
        .profile-header p {
          color: #666;
          font-size: 16px;
        }
        .profile-card {
          background: white;
          border-radius: 15px;
          padding: 25px;
          box-shadow: 0 5px 20px rgba(13, 71, 161, 0.08);
          border: 1px solid rgba(0, 188, 212, 0.1);
          margin-bottom: 25px;
        }
        .profile-card h5 {
          color: #0D47A1;
          font-weight: 700;
          margin-bottom: 20px;
          font-size: 18px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .user-info-item {
          margin-bottom: 15px;
          padding-bottom: 15px;
          border-bottom: 1px solid #E3F2FD;
        }
        .user-info-item:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }
        .user-info-item strong {
          color: #0D47A1;
          display: block;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 5px;
        }
        .user-info-item p {
          color: #333;
          margin: 0;
          font-size: 16px;
        }
        .wallet-overview-card {
          background: linear-gradient(135deg, #0D47A1 0%, #00BCD4 100%);
          color: white;
          border-radius: 15px;
          padding: 30px;
          box-shadow: 0 10px 30px rgba(13, 71, 161, 0.2);
          margin-bottom: 25px;
        }
        .wallet-stat {
          text-align: center;
          margin-bottom: 20px;
        }
        .wallet-stat:last-child {
          margin-bottom: 0;
        }
        .wallet-stat-label {
          font-size: 12px;
          opacity: 0.9;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }
        .wallet-stat-value {
          font-size: 28px;
          font-weight: 700;
        }
        .transaction-table {
          border-collapse: collapse;
        }
        .transaction-table thead {
          background: linear-gradient(135deg, #0D47A1 0%, #00BCD4 100%);
          color: white;
        }
        .transaction-table thead th {
          border: none;
          padding: 15px;
          font-weight: 600;
          letter-spacing: 0.5px;
          font-size: 13px;
        }
        .transaction-table tbody tr {
          border-bottom: 1px solid #E3F2FD;
          transition: all 0.2s ease;
        }
        .transaction-table tbody tr:hover {
          background: #F8FBFF;
        }
        .transaction-table tbody td {
          padding: 15px;
          vertical-align: middle;
          font-size: 14px;
        }
        .transaction-id {
          font-weight: 600;
          color: #0D47A1;
        }
        .empty-transactions {
          text-align: center;
          padding: 40px 20px;
          color: #999;
        }
        .chart-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 250px;
        }
        .alert-custom {
          border-radius: 10px;
          border: none;
          padding: 15px 20px;
          margin-bottom: 20px;
          font-weight: 500;
          background: rgba(0, 188, 212, 0.1);
          color: #0D47A1;
          border-left: 4px solid #00BCD4;
        }
      `}</style>

      <div className="profile-container">
        <Container>
          <div className="profile-header">
            <h2>👤 My Profile</h2>
            <p>View your account information and transaction history</p>
          </div>

          {message && <Alert className="alert-custom">{message}</Alert>}

          <Row>
            {/* User Information Card */}
            <Col lg={4}>
              <div className="profile-card">
                <h5>👥 Personal Information</h5>
                <div className="user-info-item">
                  <strong>Full Name</strong>
                  <p>{storedUser?.name}</p>
                </div>
                <div className="user-info-item">
                  <strong>Email Address</strong>
                  <p>{storedUser?.email}</p>
                </div>
                <div className="user-info-item">
                  <strong>Role</strong>
                  <p>{roleLabels[storedUser?.role_id] || "—"}</p>
                </div>
                <div className="user-info-item">
                  <strong>Company</strong>
                  <p>{storedUser?.company_name || "Main Company"}</p>
                </div>
              </div>
            </Col>

            {/* Wallet Overview */}
            <Col lg={8}>
              <div className="wallet-overview-card">
                <h5 style={{ color: "white", marginBottom: "25px" }}>💰 Wallet Overview</h5>
                <Row>
                  <Col md={6}>
                    <div className="wallet-stat">
                      <div className="wallet-stat-label">Current Balance</div>
                      <div className="wallet-stat-value">₹{Number(wallet.balance).toLocaleString()}</div>
                    </div>
                    <div className="wallet-stat">
                      <div className="wallet-stat-label">Total Transactions</div>
                      <div className="wallet-stat-value">{transactions.length}</div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="chart-container">
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
                              <Cell
                                key={`cell-${index}`}
                                fill={index === 0 ? "#4CAF50" : "#FF6B6B"}
                              />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => `₹${Number(value).toLocaleString()}`} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </Col>
                </Row>
              </div>

              {/* Transaction History */}
              <div className="profile-card">
                <h5>📋 Transaction History</h5>
                <div style={{ overflowX: "auto" }}>
                  <Table className="transaction-table" hover>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>From</th>
                        <th>To</th>
                        <th>Amount</th>
                        <th>Description</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="empty-transactions">
                            No transactions found. Start making bookings!
                          </td>
                        </tr>
                      ) : (
                        transactions.map((t) => (
                          <tr key={t.id}>
                            <td className="transaction-id">{t.id}</td>
                            <td>{t.from_level}</td>
                            <td>{t.to_level}</td>
                            <td>
                              <strong>₹{Number(t.amount).toLocaleString()}</strong>
                            </td>
                            <td>{t.description}</td>
                            <td>{new Date(t.created_at).toLocaleDateString()}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
}

const roleLabels = {
  1: "Super Admin",
  2: "Company Admin",
  3: "Manager",
  4: "Employee",
  5: "Finance",
  6: "HR",
  7: "Subsidiary Admin"
};

export default ProfilePage;
