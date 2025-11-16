import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import EmployeePage from "./pages/EmployeePage";
import AddSubsidiary from "./pages/AddSubsidiary";
import AddStorehouse from "./pages/AddStorehouse";
import DepartmentPage from "./pages/DepartmentPage";
import BookingPage from "./pages/BookingPage";
import StatusPage from "./pages/StatusPage";
import ManagerApprovalPage from "./pages/ManagerApprovalPage";
import CompanyWalletPage from "./pages/CompanyWalletPage";
import SubsidiaryWalletPage from "./pages/SubsidiaryWalletPage";
import ProfilePage from "./pages/ProfilePage";

function App() {
  // Load dotlottie script globally once
  useEffect(() => {
    const src = "https://unpkg.com/@lottiefiles/dotlottie-wc@0.8.5/dist/dotlottie-wc.js";
    if (!document.querySelector(`script[src="${src}"]`)) {
      const s = document.createElement("script");
      s.src = src;
      s.type = "module";
      s.async = true;
      document.head.appendChild(s);
    }
  }, []);

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
          <Route path="/status" element={<StatusPage />} />
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
