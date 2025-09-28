import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';

function Header() {
  return (
    <div className="app-header">
      <Container>
        <Navbar expand="lg" variant="dark" className="bg-transparent">
          <Navbar.Brand href="#" className="fw-bold fs-3">
            <i className="bi bi-lightning-charge me-2"></i>
            Electron React Bootstrap
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Button variant="outline-light" className="me-2">
                <i className="bi bi-download me-1"></i>
                Export
              </Button>
              <Button variant="light">
                <i className="bi bi-gear me-1"></i>
                Settings
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Navbar>
        
        <div className="text-center mt-4">
          <h1 className="display-4 fw-bold mb-3">Welcome to Your Desktop App</h1>
          <p className="lead">
            A modern desktop application built with Electron, React, and Bootstrap
          </p>
        </div>
      </Container>
    </div>
  );
}

export default Header;
