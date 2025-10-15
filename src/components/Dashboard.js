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
    { id: 1, type: 'success', message: '应用启动成功！欢迎使用火山AI创作工坊' },
    { id: 2, type: 'info', message: '提示：请先在设置页面配置API密钥以使用所有功能' }
  ]);

  const recentActivities = [
    { id: 1, action: '应用启动', time: '2 分钟前', status: 'success' },
    { id: 2, action: '设置更新', time: '5 分钟前', status: 'info' },
    { id: 3, action: '数据同步', time: '10 分钟前', status: 'success' },
    { id: 4, action: '用户登录', time: '15 分钟前', status: 'primary' }
  ];

  const dismissNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <i className="bi bi-speedometer2 me-2"></i>
          工作台
        </h2>
        <Button variant="primary" className="btn-gradient">
          <i className="bi bi-plus-circle me-1"></i>
          新建项目
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
            <p className="mb-0">总项目数</p>
          </div>
        </Col>
        <Col md={3}>
          <div className="stats-card text-center">
            <i className="bi bi-people display-4 mb-2"></i>
            <h3 className="mb-1">{stats.activeUsers}</h3>
            <p className="mb-0">活跃用户</p>
          </div>
        </Col>
        <Col md={3}>
          <div className="stats-card text-center">
            <i className="bi bi-heart-pulse display-4 mb-2"></i>
            <h3 className="mb-1">{stats.systemHealth}%</h3>
            <p className="mb-0">系统健康度</p>
          </div>
        </Col>
        <Col md={3}>
          <div className="stats-card text-center">
            <i className="bi bi-clock display-4 mb-2"></i>
            <h6 className="mb-1">{stats.lastUpdate}</h6>
            <p className="mb-0">最后更新</p>
          </div>
        </Col>
      </Row>

      <Row>
        {/* System Status */}
        <Col md={6}>
          <Card className="feature-card h-100">
            <Card.Header className="bg-primary text-white">
              <i className="bi bi-activity me-2"></i>
              系统状态
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>CPU 使用率</span>
                  <span>45%</span>
                </div>
                <ProgressBar variant="info" now={45} />
              </div>
              
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>内存使用率</span>
                  <span>62%</span>
                </div>
                <ProgressBar variant="warning" now={62} />
              </div>
              
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>磁盘使用率</span>
                  <span>78%</span>
                </div>
                <ProgressBar variant="danger" now={78} />
              </div>

              {electronInfo.isElectron && (
                <div className="version-info mt-3">
                  <strong>运行平台:</strong> {electronInfo.platform}<br />
                  <strong>运行环境:</strong> Electron 桌面应用
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
              最近活动
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
                  查看所有活动
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
              快捷操作
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3} className="text-center mb-3">
                  <Button variant="outline-primary" className="w-100 py-3">
                    <i className="bi bi-plus-circle display-6 d-block mb-2"></i>
                    新建项目
                  </Button>
                </Col>
                <Col md={3} className="text-center mb-3">
                  <Button variant="outline-success" className="w-100 py-3">
                    <i className="bi bi-upload display-6 d-block mb-2"></i>
                    导入数据
                  </Button>
                </Col>
                <Col md={3} className="text-center mb-3">
                  <Button variant="outline-warning" className="w-100 py-3">
                    <i className="bi bi-download display-6 d-block mb-2"></i>
                    导出数据
                  </Button>
                </Col>
                <Col md={3} className="text-center mb-3">
                  <Button variant="outline-info" className="w-100 py-3">
                    <i className="bi bi-gear display-6 d-block mb-2"></i>
                    设置
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
