import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import EmployeePage from "./pages/EmployeePage";
import AddSubsidiary from "./pages/AddSubsidiary";
import AddStorehouse from "./pages/AddStorehouse";
import DepartmentPage from "./pages/DepartmentPage";
import BookingPage from "./pages/BookingPage";
import StatusPage from "./pages/StatusPage"; // added import
import ManagerApprovalPage from "./pages/ManagerApprovalPage";
import CompanyWalletPage from "./pages/CompanyWalletPage";
import SubsidiaryWalletPage from "./pages/SubsidiaryWalletPage";
import ProfilePage from "./pages/ProfilePage";

function App() {
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  // Helper to conditionally render Navbar
  function AppContent() {
    const location = useLocation();
    const hideNavbar = location.pathname === "/login";
    return (
      <>
        {!hideNavbar && <Navbar onLogout={handleLogout} />}
        <Routes>
          <Route path="/" element={<Dashboard />} />        
          <Route path="/register" element={<Register />} />
          <Route path="/employees" element={<EmployeePage />} />
          <Route path="/subsidiaries" element={<AddSubsidiary />} />
          <Route path="/storehouses" element={<AddStorehouse />} />
          <Route path="/departments" element={<DepartmentPage />} />
          <Route path="/bookings" element={<BookingPage />} />
          <Route path="/status" element={<StatusPage />} /> {/* added route */}
          <Route path="/manager-approvals" element={<ManagerApprovalPage />} />
          <Route path="/wallet/company" element={<CompanyWalletPage />} />
          <Route path="/wallet/subsidiary" element={<SubsidiaryWalletPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </>
    );
  }

  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
