import { Navbar, Nav, Container, Button } from "react-bootstrap";

function AppNavbar({ onLogout }) {
  const isLoggedIn = !!localStorage.getItem("token");

  return (
    <Navbar bg="primary" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand href="/">Eastern Travel Needz</Navbar.Brand>
        <Nav className="ms-auto">
          {isLoggedIn ? (
            <Button variant="light" onClick={onLogout}>
              Logout
            </Button>
          ) : (
            <>
              <Nav.Link href="/login">Login</Nav.Link>
              <Nav.Link href="/register">Register</Nav.Link>
            </>
          )}
        </Nav>
      </Container>
    </Navbar>
  );
}

export default AppNavbar;
