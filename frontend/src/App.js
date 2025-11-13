import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import EmployeePage from "./pages/EmployeePage";
import AddSubsidiary from "./pages/AddSubsidiary";
import AddStorehouse from "./pages/AddStorehouse";
import DepartmentPage from "./pages/DepartmentPage";
import BookingPage from "./pages/BookingPage";
import ManagerApprovalPage from "./pages/ManagerApprovalPage";
import CompanyWalletPage from "./pages/CompanyWalletPage";
import SubsidiaryWalletPage from "./pages/SubsidiaryWalletPage";
import ProfilePage from "./pages/ProfilePage";

function App() {
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <Router>
      <Navbar onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Dashboard />} />        
        <Route path="/register" element={<Register />} />
        <Route path="/employees" element={<EmployeePage />} />
        <Route path="/subsidiaries" element={<AddSubsidiary />} />
        <Route path="/storehouses" element={<AddStorehouse />} />
        <Route path="/departments" element={<DepartmentPage />} />
        <Route path="/bookings" element={<BookingPage />} />
        <Route path="/manager-approvals" element={<ManagerApprovalPage />} />
        <Route path="/wallet/company" element={<CompanyWalletPage />} />
        <Route path="/wallet/subsidiary" element={<SubsidiaryWalletPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
      <Routes>
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
