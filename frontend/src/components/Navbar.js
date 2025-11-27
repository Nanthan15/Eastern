import { useEffect, useState } from "react";
import { Navbar, Nav, Container, NavDropdown } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import appLogo from "../resouce/app.png"; // import logo

function AppNavbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (!user) return null;

  const { role_id } = user;

  // 🧩 Role-based navigation
  const renderLinks = () => {
    switch (role_id) {
      case 1: // Super Admin
        return (
          <>
            <Nav.Link as={Link} to="/wallet/company">Company Wallet</Nav.Link>
            <Nav.Link as={Link} to="/subsidiaries">Subsidiaries</Nav.Link>
            <Nav.Link as={Link} to="/profile">Profile</Nav.Link>
          </>

        );

      case 2: // Company Admin
        return (
          <>
            <Nav.Link as={Link} to="/wallet/company">Wallet</Nav.Link>
            <Nav.Link as={Link} to="/subsidiaries">Subsidiaries</Nav.Link>
            <Nav.Link as={Link} to="/profile">Profile</Nav.Link>
          </>
        );

      case 3: // Manager
        return (
          <>
            <Nav.Link as={Link} to="/manager-approvals">Approvals</Nav.Link>
            <Nav.Link as={Link} to="/bookings">Bookings</Nav.Link>
            <Nav.Link as={Link} to="/profile">Profile</Nav.Link>
            
          </>
        );

      case 4: // Employee
        return (
          <>
            <Nav.Link as={Link} to="/bookings">Bookings</Nav.Link>
            <Nav.Link as={Link} to="/status">Status</Nav.Link>
            <Nav.Link as={Link} to="/profile">Profile</Nav.Link>
          </>
        );

      case 5: // Finance
        return (
          <>
            <Nav.Link as={Link} to="/bookings">Bookings</Nav.Link>
            <Nav.Link as={Link} to="/status">Status</Nav.Link>
            <Nav.Link as={Link} to="/profile">Profile</Nav.Link>           

            
          </>
        );

      case 6: // HR
        return (
          <>
            <Nav.Link as={Link} to="/register">Register Employee</Nav.Link>
            <Nav.Link as={Link} to="/bookings">Bookings</Nav.Link>
            <Nav.Link as={Link} to="/profile">Profile</Nav.Link>
          </>
        );

      case 7: // Subdaridary admin
        return (
          <>
            <Nav.Link as={Link} to="/wallet/subsidiary">Wallet</Nav.Link>
            <Nav.Link as={Link} to="/employees">Employees</Nav.Link>
            <Nav.Link as={Link} to="/profile">Profile</Nav.Link>
          </>
        );

      default:
        return (
          <>
            <Nav.Link as={Link} to="/profile">Profile</Nav.Link>
          </>
        );
    }
  };

  return (
    <>
      <style>{`
        .navbar-custom {
          background: linear-gradient(90deg, #0D47A1 0%, #00BCD4 100%) !important;
          box-shadow: 0 4px 12px rgba(13, 71, 161, 0.15);
        }
        .navbar-custom .navbar-brand {
          font-weight: 700;
          font-size: 24px;
          color: white !important;
          letter-spacing: 0.5px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .navbar-custom .navbar-brand img {
          height: 40px;
          width: auto;
          object-fit: contain;
        }
        .navbar-brand-text {
          display: flex;
          flex-direction: column;
          line-height: 1.2;
        }
        .navbar-brand-text .brand-title {
          font-size: 16px;
          font-weight: 700;
          letter-spacing: 0.5px;
        }
        .navbar-brand-text .brand-subtitle {
          font-size: 11px;
          font-weight: 500;
          opacity: 0.9;
        }
        .navbar-custom .nav-link {
          color: rgba(255, 255, 255, 0.9) !important;
          transition: all 0.3s ease;
          margin: 0 5px;
          border-radius: 6px;
          padding: 8px 12px !important;
        }
        .navbar-custom .nav-link:hover {
          color: white !important;
          background: rgba(255, 255, 255, 0.15);
        }
        .navbar-custom .dropdown-menu {
          background: #0D47A1;
          border: 1px solid #00BCD4;
        }
        .navbar-custom .dropdown-menu .dropdown-item {
          color: rgba(255, 255, 255, 0.9);
          transition: all 0.2s ease;
        }
        .navbar-custom .dropdown-menu .dropdown-item:hover {
          background: #00BCD4;
          color: white;
        }
        .navbar-custom .dropdown-menu .dropdown-divider {
          border-color: rgba(0, 188, 212, 0.3);
        }
        .navbar-custom .navbar-toggler {
          border-color: rgba(255, 255, 255, 0.3);
        }
        .navbar-custom .navbar-toggler-icon {
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3e%3cpath stroke='rgba%28255, 255, 255, 0.9%29' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e");
        }
      `}</style>
      <Navbar className="navbar-custom" expand="lg" sticky="top">
        <Container>
          <Navbar.Brand as={Link} to="/">
            <img src={appLogo} alt="Eastern Travel Needz Logo" />
            <div className="navbar-brand-text">
              <span className="brand-title">Eastern</span>
              <span className="brand-subtitle">Travel Needz</span>
            </div>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">{renderLinks()}</Nav>
            <Nav>
              <NavDropdown title={user.name} id="user-dropdown">
                <NavDropdown.Item as={Link} to="/profile">My Profile</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
}

export default AppNavbar;
