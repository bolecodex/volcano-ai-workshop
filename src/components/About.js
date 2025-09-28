import React from 'react';
import { Row, Col, Card, Badge, Button } from 'react-bootstrap';

function About({ electronInfo }) {
  const technologies = [
    { name: 'Electron', version: '22.0.0', description: 'Cross-platform desktop apps', color: 'primary' },
    { name: 'React', version: '18.2.0', description: 'JavaScript library for building user interfaces', color: 'info' },
    { name: 'Bootstrap', version: '5.2.3', description: 'CSS framework for responsive design', color: 'success' },
    { name: 'React Bootstrap', version: '2.7.0', description: 'Bootstrap components for React', color: 'warning' }
  ];

  const features = [
    { icon: 'bi-laptop', title: 'Cross Platform', description: 'Runs on Windows, macOS, and Linux' },
    { icon: 'bi-phone', title: 'Responsive Design', description: 'Adapts to different screen sizes' },
    { icon: 'bi-shield-check', title: 'Secure', description: 'Built with security best practices' },
    { icon: 'bi-lightning', title: 'Fast Performance', description: 'Optimized for speed and efficiency' },
    { icon: 'bi-palette', title: 'Modern UI', description: 'Beautiful and intuitive interface' },
    { icon: 'bi-gear', title: 'Configurable', description: 'Customizable settings and preferences' }
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <i className="bi bi-info-circle me-2"></i>
          About
        </h2>
        <Badge bg="primary">v1.0.0</Badge>
      </div>

      {/* App Info */}
      <Row className="mb-4">
        <Col>
          <Card className="feature-card">
            <Card.Body className="text-center py-5">
              <div className="mb-4">
                <i className="bi bi-lightning-charge display-1 text-primary"></i>
              </div>
              <h3 className="mb-3">Electron React Bootstrap App</h3>
              <p className="lead text-muted mb-4">
                A modern desktop application template built with the latest web technologies.
                This app demonstrates the power of combining Electron, React, and Bootstrap
                to create beautiful, cross-platform desktop applications.
              </p>
              <div className="d-flex justify-content-center gap-2">
                <Button variant="outline-primary">
                  <i className="bi bi-github me-1"></i>
                  View Source
                </Button>
                <Button variant="outline-success">
                  <i className="bi bi-download me-1"></i>
                  Download
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Technologies Used */}
      <Row className="mb-4">
        <Col>
          <Card className="feature-card">
            <Card.Header className="bg-primary text-white">
              <i className="bi bi-stack me-2"></i>
              Technologies Used
            </Card.Header>
            <Card.Body>
              <Row>
                {technologies.map((tech, index) => (
                  <Col md={6} key={index} className="mb-3">
                    <div className="d-flex align-items-center p-3 border rounded">
                      <Badge bg={tech.color} className="me-3 fs-6">
                        {tech.name}
                      </Badge>
                      <div>
                        <h6 className="mb-1">{tech.name} {tech.version}</h6>
                        <small className="text-muted">{tech.description}</small>
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Features */}
      <Row className="mb-4">
        <Col>
          <Card className="feature-card">
            <Card.Header className="bg-success text-white">
              <i className="bi bi-star me-2"></i>
              Key Features
            </Card.Header>
            <Card.Body>
              <Row>
                {features.map((feature, index) => (
                  <Col md={4} key={index} className="mb-4">
                    <div className="text-center">
                      <i className={`${feature.icon} display-4 text-primary mb-3`}></i>
                      <h5>{feature.title}</h5>
                      <p className="text-muted">{feature.description}</p>
                    </div>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* System Information */}
      <Row>
        <Col md={6}>
          <Card className="feature-card">
            <Card.Header className="bg-info text-white">
              <i className="bi bi-pc-display me-2"></i>
              System Information
            </Card.Header>
            <Card.Body>
              <div className="version-info">
                <div className="mb-2">
                  <strong>Platform:</strong> {electronInfo.platform || 'Unknown'}
                </div>
                <div className="mb-2">
                  <strong>Environment:</strong> {electronInfo.isElectron ? 'Electron Desktop' : 'Web Browser'}
                </div>
                <div className="mb-2">
                  <strong>Node.js:</strong> <span id="node-version">Loading...</span>
                </div>
                <div className="mb-2">
                  <strong>Chrome:</strong> <span id="chrome-version">Loading...</span>
                </div>
                <div className="mb-2">
                  <strong>Electron:</strong> <span id="electron-version">Loading...</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="feature-card">
            <Card.Header className="bg-warning text-dark">
              <i className="bi bi-person-circle me-2"></i>
              Credits & License
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <h6>Created by</h6>
                <p className="text-muted">Your Development Team</p>
              </div>
              
              <div className="mb-3">
                <h6>License</h6>
                <p className="text-muted">MIT License - Free to use and modify</p>
              </div>
              
              <div className="mb-3">
                <h6>Support</h6>
                <p className="text-muted">
                  For support and documentation, visit our 
                  <a href="#" className="text-decoration-none"> GitHub repository</a>
                </p>
              </div>

              <div className="text-center mt-4">
                <Button variant="outline-primary" size="sm" className="me-2">
                  <i className="bi bi-bug me-1"></i>
                  Report Bug
                </Button>
                <Button variant="outline-success" size="sm">
                  <i className="bi bi-lightbulb me-1"></i>
                  Request Feature
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default About;
