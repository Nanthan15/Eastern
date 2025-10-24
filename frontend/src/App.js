import { useEffect, useState } from 'react';
import API from './services/api';
import { Container, Navbar, Button } from 'react-bootstrap';

function App() {
  const [msg, setMsg] = useState('');

  useEffect(() => {
    API.get('/')
      .then(res => setMsg(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <>
      <Navbar bg="primary" variant="dark">
        <Container>
          <Navbar.Brand>Eastern Travel Needz</Navbar.Brand>
          <Button variant="light">Logout</Button>
        </Container>
      </Navbar>

      <Container className="mt-4">
        <h2 className="text-primary">Frontend Connected ✅</h2>
        <p>{msg}</p>
      </Container>
    </>
  );
}

export default App;
