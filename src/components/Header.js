import React from 'react';
import { Navbar, Nav, Container, Button, Badge } from 'react-bootstrap';

function Header() {
  return (
    <div className="app-header">
      <Container>
        <Navbar expand="lg" variant="dark" className="bg-transparent">
          <Navbar.Brand href="#" className="fw-bold fs-3">
            <i className="bi bi-lightning-charge me-2"></i>
            火山AI创作工坊
            <Badge bg="danger" className="ms-2 fs-6">v1.2.0</Badge>
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
          <h1 className="display-4 fw-bold mb-3">
            欢迎使用火山AI创作工坊
            <Badge bg="warning" text="dark" className="ms-3 fs-6">全新升级</Badge>
          </h1>
          <p className="lead mb-2">
            基于火山引擎API构建的智能创作平台
          </p>
          <p className="lead">
            <span className="me-3">🎨 图片生成</span>
            <span className="me-3">🖌️ 智能绘图 <Badge bg="danger" pill>NEW</Badge></span>
            <span className="me-3">🎬 视频生成</span>
            <span className="me-3">🎭 动作模仿 <Badge bg="warning" pill>UP</Badge></span>
            <span className="me-3">🧑 数字人 <Badge bg="danger" pill>NEW</Badge></span>
            <span>🔍 智能搜索</span>
          </p>
        </div>
      </Container>
    </div>
  );
}

export default Header;
