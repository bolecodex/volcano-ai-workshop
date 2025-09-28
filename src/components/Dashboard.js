import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Alert, Badge, ProgressBar, Table } from 'react-bootstrap';

function Dashboard({ electronInfo }) {
  const [stats, setStats] = useState({
    totalProjects: 12,
    activeUsers: 1,
    systemHealth: 98,
    lastUpdate: new Date().toLocaleString()
  });

  const [notifications, setNotifications] = useState([
    { id: 1, type: 'success', message: 'Application started successfully!' },
    { id: 2, type: 'info', message: 'Welcome to your new Electron app!' }
  ]);

  const recentActivities = [
    { id: 1, action: 'Application Started', time: '2 minutes ago', status: 'success' },
    { id: 2, action: 'Settings Updated', time: '5 minutes ago', status: 'info' },
    { id: 3, action: 'Data Synced', time: '10 minutes ago', status: 'success' },
    { id: 4, action: 'User Login', time: '15 minutes ago', status: 'primary' }
  ];

  const dismissNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <i className="bi bi-speedometer2 me-2"></i>
          Dashboard
        </h2>
        <Button variant="primary" className="btn-gradient">
          <i className="bi bi-plus-circle me-1"></i>
          New Project
        </Button>
      </div>

      {/* Notifications */}
      {notifications.map((notification) => (
        <Alert 
          key={notification.id} 
          variant={notification.type} 
          dismissible 
          onClose={() => dismissNotification(notification.id)}
          className="mb-3"
        >
          {notification.message}
        </Alert>
      ))}

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <div className="stats-card text-center">
            <i className="bi bi-folder2-open display-4 mb-2"></i>
            <h3 className="mb-1">{stats.totalProjects}</h3>
            <p className="mb-0">Total Projects</p>
          </div>
        </Col>
        <Col md={3}>
          <div className="stats-card text-center">
            <i className="bi bi-people display-4 mb-2"></i>
            <h3 className="mb-1">{stats.activeUsers}</h3>
            <p className="mb-0">Active Users</p>
          </div>
        </Col>
        <Col md={3}>
          <div className="stats-card text-center">
            <i className="bi bi-heart-pulse display-4 mb-2"></i>
            <h3 className="mb-1">{stats.systemHealth}%</h3>
            <p className="mb-0">System Health</p>
          </div>
        </Col>
        <Col md={3}>
          <div className="stats-card text-center">
            <i className="bi bi-clock display-4 mb-2"></i>
            <h6 className="mb-1">{stats.lastUpdate}</h6>
            <p className="mb-0">Last Update</p>
          </div>
        </Col>
      </Row>

      <Row>
        {/* System Status */}
        <Col md={6}>
          <Card className="feature-card h-100">
            <Card.Header className="bg-primary text-white">
              <i className="bi bi-activity me-2"></i>
              System Status
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>CPU Usage</span>
                  <span>45%</span>
                </div>
                <ProgressBar variant="info" now={45} />
              </div>
              
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Memory Usage</span>
                  <span>62%</span>
                </div>
                <ProgressBar variant="warning" now={62} />
              </div>
              
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Disk Usage</span>
                  <span>78%</span>
                </div>
                <ProgressBar variant="danger" now={78} />
              </div>

              {electronInfo.isElectron && (
                <div className="version-info mt-3">
                  <strong>Platform:</strong> {electronInfo.platform}<br />
                  <strong>Environment:</strong> Electron Desktop App
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Recent Activities */}
        <Col md={6}>
          <Card className="feature-card h-100">
            <Card.Header className="bg-success text-white">
              <i className="bi bi-clock-history me-2"></i>
              Recent Activities
            </Card.Header>
            <Card.Body>
              <Table responsive className="mb-0">
                <tbody>
                  {recentActivities.map((activity) => (
                    <tr key={activity.id}>
                      <td>
                        <Badge bg={activity.status} className="me-2">
                          <i className="bi bi-dot"></i>
                        </Badge>
                        {activity.action}
                      </td>
                      <td className="text-muted small text-end">
                        {activity.time}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              
              <div className="text-center mt-3">
                <Button variant="outline-primary" size="sm">
                  View All Activities
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row className="mt-4">
        <Col>
          <Card className="feature-card">
            <Card.Header className="bg-dark text-white">
              <i className="bi bi-lightning me-2"></i>
              Quick Actions
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3} className="text-center mb-3">
                  <Button variant="outline-primary" className="w-100 py-3">
                    <i className="bi bi-plus-circle display-6 d-block mb-2"></i>
                    Create New
                  </Button>
                </Col>
                <Col md={3} className="text-center mb-3">
                  <Button variant="outline-success" className="w-100 py-3">
                    <i className="bi bi-upload display-6 d-block mb-2"></i>
                    Import Data
                  </Button>
                </Col>
                <Col md={3} className="text-center mb-3">
                  <Button variant="outline-warning" className="w-100 py-3">
                    <i className="bi bi-download display-6 d-block mb-2"></i>
                    Export Data
                  </Button>
                </Col>
                <Col md={3} className="text-center mb-3">
                  <Button variant="outline-info" className="w-100 py-3">
                    <i className="bi bi-gear display-6 d-block mb-2"></i>
                    Settings
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Dashboard;
