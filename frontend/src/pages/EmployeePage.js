import { useEffect, useState } from "react";
import { Container, Form, Button, Table } from "react-bootstrap";
import API from "../services/api";

function EmployeePage(){
  const [employees,setEmployees]=useState([]);
  const [form,setForm]=useState({name:"",email:"",password:"",role_id:4,company_id:1,manager_id:null});

  const fetchEmployees=async()=>{
    const {data}=await API.get(`/employee/employees/${form.company_id}`);
    setEmployees(data);
  };

  useEffect(()=>{fetchEmployees();},[]);

  const handleSubmit=async(e)=>{
    e.preventDefault();
    await API.post("/employee/employees",form);
    setForm({...form,name:"",email:"",password:""});
    fetchEmployees();
  };

  return(
    <Container className="mt-4">
      <h4 className="text-primary">Employees</h4>
      <Form onSubmit={handleSubmit} className="mb-3">
        <Form.Control placeholder="Name" value={form.name}
          onChange={e=>setForm({...form,name:e.target.value})} className="mb-2"/>
        <Form.Control placeholder="Email" value={form.email}
          onChange={e=>setForm({...form,email:e.target.value})} className="mb-2"/>
        <Form.Control type="password" placeholder="Password" value={form.password}
          onChange={e=>setForm({...form,password:e.target.value})} className="mb-2"/>
        <Button type="submit">Add Employee</Button>
      </Form>
      <Table bordered hover>
        <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th></tr></thead>
        <tbody>
          {employees.map(e=>
            <tr key={e.id}><td>{e.id}</td><td>{e.name}</td><td>{e.email}</td><td>{e.role_id}</td></tr>
          )}
        </tbody>
      </Table>
    </Container>
  );
}
export default EmployeePage;
