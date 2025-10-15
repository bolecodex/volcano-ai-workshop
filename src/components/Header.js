import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';

function Header() {
  return (
    <div className="app-header">
      <Container>
        <Navbar expand="lg" variant="dark" className="bg-transparent">
          <Navbar.Brand href="#" className="fw-bold fs-3">
            <i className="bi bi-lightning-charge me-2"></i>
            火山AI创作工坊
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Button variant="outline-light" className="me-2">
                <i className="bi bi-download me-1"></i>
                导出
              </Button>
              <Button variant="light">
                <i className="bi bi-gear me-1"></i>
                设置
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Navbar>
        
        <div className="text-center mt-4">
          <h1 className="display-4 fw-bold mb-3">欢迎使用火山AI创作工坊</h1>
          <p className="lead">
            基于火山引擎API构建的智能创作平台 • 图片生成 • 视频生成 • 动作模仿
          </p>
        </div>
      </Container>
    </div>
  );
}

export default Header;
