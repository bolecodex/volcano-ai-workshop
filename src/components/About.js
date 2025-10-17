import React from 'react';
import { Row, Col, Card, Badge, Button } from 'react-bootstrap';

function About({ electronInfo }) {
  const technologies = [
    { name: 'Electron', version: '38.1.2', description: '跨平台桌面应用框架', color: 'primary' },
    { name: 'React', version: '18.2.0', description: '现代化前端UI框架', color: 'info' },
    { name: 'Bootstrap', version: '5.2.3', description: '响应式CSS框架', color: 'success' },
    { name: '火山引擎 API', version: '最新', description: 'AI多模态创作能力', color: 'warning' }
  ];

  const features = [
    { icon: 'bi-image', title: 'AI图片生成', description: '即梦4.0、3.1，多模型支持4K输出', badge: null },
    { icon: 'bi-brush', title: '智能绘图', description: 'Inpainting涂抹编辑，AI智能填充', badge: 'NEW' },
    { icon: 'bi-camera-video', title: 'AI视频生成', description: '即梦3.0 Pro，文生视频、图生视频', badge: null },
    { icon: 'bi-person-video2', title: '动作模仿', description: '即梦版本，更稳定逼真，支持多画幅', badge: 'UP' },
    { icon: 'bi-person-video3', title: '数字人', description: 'OmniHuman1.5，图片+音频生成视频', badge: 'NEW' },
    { icon: 'bi-search-heart', title: '智能搜索', description: '多模态检索，向量数据库', badge: null },
    { icon: 'bi-laptop', title: '跨平台', description: '支持 Windows、macOS 和 Linux', badge: null },
    { icon: 'bi-shield-check', title: '安全可靠', description: '本地存储密钥，保护隐私', badge: null },
    { icon: 'bi-lightning', title: '快速高效', description: '优化的性能和用户体验', badge: null }
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <i className="bi bi-info-circle me-2"></i>
          关于
        </h2>
        <div>
          <Badge bg="danger" className="me-2">v1.2.0</Badge>
          <Badge bg="warning" text="dark">全新升级</Badge>
        </div>
      </div>

      {/* App Info */}
      <Row className="mb-4">
        <Col>
          <Card className="feature-card">
            <Card.Body className="text-center py-5">
              <div className="mb-4">
                <i className="bi bi-lightning-charge display-1 text-primary"></i>
              </div>
              <h3 className="mb-3">
                火山AI创作工坊
                <Badge bg="danger" className="ms-3">v1.2.0</Badge>
              </h3>
              <p className="lead text-muted mb-4">
                基于火山引擎强大的AI能力打造的<strong>全能型</strong>智能创作平台。
                集成<strong>图片生成、智能绘图、视频生成、动作模仿、数字人、智能搜索</strong>等多种AI创作工具，
                为创作者提供便捷高效的创作体验。使用Electron + React技术栈构建，支持跨平台运行。
              </p>
              <div className="mb-4">
                <Badge bg="danger" className="me-2 px-3 py-2">🧑 数字人 NEW</Badge>
                <Badge bg="danger" className="me-2 px-3 py-2">🖌️ 智能绘图 NEW</Badge>
                <Badge bg="warning" text="dark" className="me-2 px-3 py-2">🎭 动作模仿 UP</Badge>
              </div>
              <div className="d-flex justify-content-center gap-2">
                <Button variant="outline-primary" href="https://www.volcengine.com/" target="_blank">
                  <i className="bi bi-globe me-1"></i>
                  火山引擎官网
                </Button>
                <Button variant="outline-success" href="https://console.volcengine.com/ark" target="_blank">
                  <i className="bi bi-key me-1"></i>
                  获取API密钥
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
              技术栈
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
              核心功能
            </Card.Header>
            <Card.Body>
              <Row>
                {features.map((feature, index) => (
                  <Col md={4} key={index} className="mb-4">
                    <div className="text-center">
                      <i className={`${feature.icon} display-4 text-primary mb-3`}></i>
                      <h5>
                        {feature.title}
                        {feature.badge && (
                          <Badge 
                            bg={feature.badge === 'NEW' ? 'danger' : 'warning'} 
                            text={feature.badge === 'UP' ? 'dark' : 'white'}
                            className="ms-2"
                            pill
                          >
                            {feature.badge}
                          </Badge>
                        )}
                      </h5>
                      <p className="text-muted small">{feature.description}</p>
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
              系统信息
            </Card.Header>
            <Card.Body>
              <div className="version-info">
                <div className="mb-2">
                  <strong>运行平台:</strong> {electronInfo.platform || '未知'}
                </div>
                <div className="mb-2">
                  <strong>运行环境:</strong> {electronInfo.isElectron ? 'Electron 桌面应用' : '网页浏览器'}
                </div>
                <div className="mb-2">
                  <strong>Node.js 版本:</strong> <span id="node-version">加载中...</span>
                </div>
                <div className="mb-2">
                  <strong>Chrome 版本:</strong> <span id="chrome-version">加载中...</span>
                </div>
                <div className="mb-2">
                  <strong>Electron 版本:</strong> <span id="electron-version">加载中...</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="feature-card">
            <Card.Header className="bg-warning text-dark">
              <i className="bi bi-person-circle me-2"></i>
              开发者与许可
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <h6>开发团队</h6>
                <p className="text-muted">AI创作工具开发团队</p>
              </div>
              
              <div className="mb-3">
                <h6>开源协议</h6>
                <p className="text-muted">MIT License - 免费使用和修改</p>
              </div>
              
              <div className="mb-3">
                <h6>技术支持</h6>
                <p className="text-muted">
                  如需技术支持，请访问
                  <a href="https://www.volcengine.com/docs" target="_blank" rel="noopener noreferrer" className="text-decoration-none"> 火山引擎文档中心</a>
                </p>
              </div>

              <div className="text-center mt-4">
                <Button variant="outline-primary" size="sm" className="me-2">
                  <i className="bi bi-bug me-1"></i>
                  报告问题
                </Button>
                <Button variant="outline-success" size="sm">
                  <i className="bi bi-lightbulb me-1"></i>
                  功能建议
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
