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
    { id: 1, type: 'success', message: '应用启动成功！欢迎使用火山AI创作工坊 v1.2.0' },
    { id: 2, type: 'warning', message: '🎉 v1.2.0 重大更新：新增数字人、智能绘图、即梦动作模仿功能！' },
    { id: 3, type: 'info', message: '提示：请先在设置页面配置API密钥以使用所有功能' }
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

      {/* New Features Highlight */}
      <Row className="mt-4">
        <Col>
          <Card className="feature-card border-warning">
            <Card.Header className="bg-gradient text-white" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <i className="bi bi-stars me-2"></i>
              ⭐ v1.2.0 新功能亮点
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={4} className="mb-3">
                  <Card className="h-100 shadow-sm hover-lift">
                    <Card.Body className="text-center">
                      <div className="feature-icon mb-3" style={{ fontSize: '3rem', color: '#667eea' }}>
                        <i className="bi bi-person-video3"></i>
                      </div>
                      <h5 className="fw-bold">🧑 数字人</h5>
                      <Badge bg="danger" className="mb-2">NEW</Badge>
                      <p className="text-muted small mb-3">
                        图片+音频生成高质量数字人视频。支持人物、宠物、动漫角色，突破竖屏限制
                      </p>
                      <div className="d-grid gap-2">
                        <Button variant="primary" size="sm">
                          <i className="bi bi-arrow-right-circle me-1"></i>
                          立即体验
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={4} className="mb-3">
                  <Card className="h-100 shadow-sm hover-lift">
                    <Card.Body className="text-center">
                      <div className="feature-icon mb-3" style={{ fontSize: '3rem', color: '#f093fb' }}>
                        <i className="bi bi-brush"></i>
                      </div>
                      <h5 className="fw-bold">🖌️ 智能绘图</h5>
                      <Badge bg="danger" className="mb-2">NEW</Badge>
                      <p className="text-muted small mb-3">
                        Inpainting涂抹编辑，AI智能填充。同步接口，实时获取结果
                      </p>
                      <div className="d-grid gap-2">
                        <Button variant="info" size="sm">
                          <i className="bi bi-arrow-right-circle me-1"></i>
                          开始创作
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={4} className="mb-3">
                  <Card className="h-100 shadow-sm hover-lift">
                    <Card.Body className="text-center">
                      <div className="feature-icon mb-3" style={{ fontSize: '3rem', color: '#4facfe' }}>
                        <i className="bi bi-person-video2"></i>
                      </div>
                      <h5 className="fw-bold">🎭 即梦动作模仿</h5>
                      <Badge bg="warning" className="mb-2">UPGRADED</Badge>
                      <p className="text-muted small mb-3">
                        更稳定、更逼真。支持各种画幅，与经典版本共存可切换
                      </p>
                      <div className="d-grid gap-2">
                        <Button variant="success" size="sm">
                          <i className="bi bi-arrow-right-circle me-1"></i>
                          查看升级
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* All Features Overview */}
      <Row className="mt-4">
        <Col>
          <Card className="feature-card">
            <Card.Header className="bg-dark text-white">
              <i className="bi bi-grid-3x3 me-2"></i>
              所有功能
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3} className="text-center mb-3">
                  <div className="feature-box p-3">
                    <i className="bi bi-image display-6 d-block mb-2 text-primary"></i>
                    <h6 className="fw-bold">AI 图片生成</h6>
                    <small className="text-muted">文生图、图生图<br/>多模型支持</small>
                  </div>
                </Col>
                <Col md={3} className="text-center mb-3">
                  <div className="feature-box p-3">
                    <i className="bi bi-brush display-6 d-block mb-2 text-info"></i>
                    <h6 className="fw-bold">智能绘图 <Badge bg="danger" pill>NEW</Badge></h6>
                    <small className="text-muted">涂抹编辑<br/>智能填充</small>
                  </div>
                </Col>
                <Col md={3} className="text-center mb-3">
                  <div className="feature-box p-3">
                    <i className="bi bi-camera-video display-6 d-block mb-2 text-success"></i>
                    <h6 className="fw-bold">AI 视频生成</h6>
                    <small className="text-muted">文生视频、图生视频<br/>即梦 3.0 Pro</small>
                  </div>
                </Col>
                <Col md={3} className="text-center mb-3">
                  <div className="feature-box p-3">
                    <i className="bi bi-person-video2 display-6 d-block mb-2 text-warning"></i>
                    <h6 className="fw-bold">动作模仿 <Badge bg="warning" pill>UP</Badge></h6>
                    <small className="text-muted">即梦版本<br/>经典版本</small>
                  </div>
                </Col>
                <Col md={3} className="text-center mb-3">
                  <div className="feature-box p-3">
                    <i className="bi bi-person-video3 display-6 d-block mb-2 text-purple"></i>
                    <h6 className="fw-bold">数字人 <Badge bg="danger" pill>NEW</Badge></h6>
                    <small className="text-muted">OmniHuman1.5<br/>图片+音频</small>
                  </div>
                </Col>
                <Col md={3} className="text-center mb-3">
                  <div className="feature-box p-3">
                    <i className="bi bi-search-heart display-6 d-block mb-2 text-danger"></i>
                    <h6 className="fw-bold">智能搜图</h6>
                    <small className="text-muted">多模态搜索<br/>向量数据库</small>
                  </div>
                </Col>
                <Col md={3} className="text-center mb-3">
                  <div className="feature-box p-3">
                    <i className="bi bi-gear display-6 d-block mb-2 text-secondary"></i>
                    <h6 className="fw-bold">设置</h6>
                    <small className="text-muted">API配置<br/>系统设置</small>
                  </div>
                </Col>
                <Col md={3} className="text-center mb-3">
                  <div className="feature-box p-3">
                    <i className="bi bi-info-circle display-6 d-block mb-2 text-info"></i>
                    <h6 className="fw-bold">关于</h6>
                    <small className="text-muted">版本信息<br/>使用帮助</small>
                  </div>
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
