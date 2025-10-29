import { useEffect, useState } from "react";
import API from "../services/api";
import { Container } from "react-bootstrap";

function Dashboard() {
  const [data, setData] = useState("");

  useEffect(() => {
    API.get("/") // test backend root
      .then((res) => setData(res.data))
      .catch(() => setData("Error connecting to backend"));
  }, []);

  return (
    <Container className="text-center mt-5">
      <h3 className="text-primary">Welcome to Eastern Travel Needz</h3>
      <p>{data}</p>
    </Container>
  );
}

export default Dashboard;
