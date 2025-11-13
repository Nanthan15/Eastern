import { useEffect, useState } from "react";
import { Navbar, Nav, Container, NavDropdown } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";

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
            <Nav.Link as={Link} to="/company/subsidiaries">Subsidiaries</Nav.Link>
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
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top">
      <Container>
        <Navbar.Brand as={Link} to="/">Eastern Portal</Navbar.Brand>
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
  );
}

export default AppNavbar;
