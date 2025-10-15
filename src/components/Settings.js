import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Button, Alert, Badge } from 'react-bootstrap';
import { storage } from '../utils/storage';

function Settings() {
  const [settings, setSettings] = useState({
    theme: 'light',
    notifications: true,
    autoSave: true,
    language: 'en',
    fontSize: 'medium'
  });

  const [apiCredentials, setApiCredentials] = useState({
    apiKey: '',
    accessKeyId: '',
    secretAccessKey: ''
  });

  const [tosConfig, setTosConfig] = useState({
    bucket: '',
    region: 'cn-beijing',
    endpoint: ''
  });

  const [showAlert, setShowAlert] = useState(false);
  const [credentialsAlert, setCredentialsAlert] = useState({ show: false, type: '', message: '' });

  // 加载已保存的API凭证和TOS配置
  useEffect(() => {
    setApiCredentials({
      apiKey: storage.getApiKey(),
      accessKeyId: storage.getAccessKeyId(),
      secretAccessKey: storage.getSecretAccessKey()
    });
    
    setTosConfig(storage.getTOSConfig());
  }, []);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    // Here you would typically save to localStorage or send to backend
    console.log('Saving settings:', settings);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const handleReset = () => {
    setSettings({
      theme: 'light',
      notifications: true,
      autoSave: true,
      language: 'en',
      fontSize: 'medium'
    });
  };

  const handleSaveCredentials = () => {
    try {
      // 保存 API Key
      if (apiCredentials.apiKey) {
        storage.setApiKey(apiCredentials.apiKey);
      }
      
      // 保存 AccessKey 和 SecretKey
      if (apiCredentials.accessKeyId && apiCredentials.secretAccessKey) {
        storage.setAccessKeys(apiCredentials.accessKeyId, apiCredentials.secretAccessKey);
      }
      
      setCredentialsAlert({ 
        show: true, 
        type: 'success', 
        message: 'API 凭证保存成功！' 
      });
      
      setTimeout(() => {
        setCredentialsAlert({ show: false, type: '', message: '' });
      }, 3000);
    } catch (error) {
      setCredentialsAlert({ 
        show: true, 
        type: 'danger', 
        message: '保存失败：' + error.message 
      });
    }
  };

  const handleCredentialChange = (key, value) => {
    setApiCredentials(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleTosConfigChange = (key, value) => {
    setTosConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveTosConfig = () => {
    try {
      if (tosConfig.bucket) {
        storage.setTOSConfig(tosConfig);
        setCredentialsAlert({ 
          show: true, 
          type: 'success', 
          message: 'TOS 对象存储配置保存成功！' 
        });
      } else {
        setCredentialsAlert({ 
          show: true, 
          type: 'warning', 
          message: '请至少填写 Bucket 名称' 
        });
      }
      
      setTimeout(() => {
        setCredentialsAlert({ show: false, type: '', message: '' });
      }, 3000);
    } catch (error) {
      setCredentialsAlert({ 
        show: true, 
        type: 'danger', 
        message: '保存失败：' + error.message 
      });
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <i className="bi bi-gear me-2"></i>
          Settings
        </h2>
        <Badge bg="secondary">Version 1.0.0</Badge>
      </div>

      {showAlert && (
        <Alert variant="success" className="mb-4">
          <i className="bi bi-check-circle me-2"></i>
          Settings saved successfully!
        </Alert>
      )}

      {/* API Credentials Section */}
      <Row>
        <Col>
          <Card className="feature-card mb-4 border-primary">
            <Card.Header className="bg-primary text-white">
              <i className="bi bi-key me-2"></i>
              API 凭证配置
            </Card.Header>
            <Card.Body>
              {credentialsAlert.show && (
                <Alert variant={credentialsAlert.type} className="mb-3">
                  {credentialsAlert.message}
                </Alert>
              )}

              <Row>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <i className="bi bi-1-circle me-1"></i>
                      API Key (用于图片生成和视频生成)
                    </Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="输入火山方舟 API Key"
                      value={apiCredentials.apiKey}
                      onChange={(e) => handleCredentialChange('apiKey', e.target.value)}
                    />
                    <Form.Text className="text-muted">
                      在 <a href="https://console.volcengine.com/ark" target="_blank" rel="noopener noreferrer">火山方舟控制台</a> 获取 API Key
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>

              <hr className="my-4" />

              <Row>
                <Col md={12} className="mb-3">
                  <h6>
                    <i className="bi bi-2-circle me-1"></i>
                    访问密钥 (用于动作模仿功能)
                  </h6>
                  <small className="text-muted">
                    动作模仿功能需要使用火山引擎 IAM 访问密钥（AccessKey）
                  </small>
                </Col>
                
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>AccessKeyId</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="输入 AccessKeyId"
                      value={apiCredentials.accessKeyId}
                      onChange={(e) => handleCredentialChange('accessKeyId', e.target.value)}
                    />
                  </Form.Group>
                </Col>
                
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>SecretAccessKey</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="输入 SecretAccessKey"
                      value={apiCredentials.secretAccessKey}
                      onChange={(e) => handleCredentialChange('secretAccessKey', e.target.value)}
                    />
                  </Form.Group>
                </Col>

                <Col md={12}>
                  <Form.Text className="text-muted">
                    在 <a href="https://console.volcengine.com/iam/keymanage" target="_blank" rel="noopener noreferrer">火山引擎 IAM</a> 创建访问密钥
                  </Form.Text>
                </Col>
              </Row>

              <Alert variant="info" className="mt-3 mb-3">
                <i className="bi bi-info-circle me-2"></i>
                <strong>说明：</strong>
                <ul className="mb-0 mt-2 small">
                  <li><strong>API Key:</strong> 用于图片生成（Seedream）和视频生成（Seedance）功能</li>
                  <li><strong>AccessKey:</strong> 用于动作模仿功能，需要配置 AccessKeyId 和 SecretAccessKey</li>
                  <li>凭证会安全地保存在本地浏览器存储中</li>
                </ul>
              </Alert>

              <Alert variant="warning" className="mb-0">
                <i className="bi bi-exclamation-triangle me-2"></i>
                <strong>⚠️ 关于即梦AI 4.0：</strong>
                <ul className="mb-0 mt-2 small">
                  <li><strong>即梦4.0目前处于公测阶段</strong>，需要单独申请权限</li>
                  <li>即使配置了AccessKey，如果没有即梦4.0权限，会出现"Access Denied"错误</li>
                  <li>申请地址：<a href="https://console.volcengine.com/" target="_blank" rel="noopener noreferrer" className="text-white"><u>火山引擎控制台</u></a></li>
                  <li>推荐：在等待审批期间，可以使用<strong>Seedream 4.0</strong>模型（不需要AccessKey）</li>
                </ul>
              </Alert>

              <div className="mt-3 text-end">
                <Button variant="primary" onClick={handleSaveCredentials}>
                  <i className="bi bi-save me-1"></i>
                  保存 API 凭证
                </Button>
              </div>
            </Card.Body>
          </Card>

          {/* TOS 对象存储配置 */}
          <Card className="feature-card mb-4 border-info">
            <Card.Header className="bg-info text-white">
              <i className="bi bi-cloud-upload me-2"></i>
              TOS 对象存储配置（用于本地文件上传）
            </Card.Header>
            <Card.Body>
              <Alert variant="info" className="py-2 px-3 mb-3">
                <small>
                  <i className="bi bi-info-circle me-1"></i>
                  <strong>说明：</strong>动作模仿功能使用本地文件上传时，需要先将文件上传到火山引擎TOS对象存储，然后获取URL再提交给API。
                  <br />
                  请先在 <a href="https://console.volcengine.com/tos" target="_blank" rel="noopener noreferrer">火山引擎TOS控制台</a> 创建Bucket并配置权限。
                </small>
              </Alert>

              <Form.Group className="mb-3">
                <Form.Label>
                  <i className="bi bi-bucket me-1"></i>
                  Bucket 名称 <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="your-bucket-name"
                  value={tosConfig.bucket}
                  onChange={(e) => handleTosConfigChange('bucket', e.target.value)}
                />
                <Form.Text className="text-muted">
                  在 TOS 控制台创建的存储桶名称
                </Form.Text>
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <i className="bi bi-geo-alt me-1"></i>
                      区域
                    </Form.Label>
                    <Form.Select
                      value={tosConfig.region}
                      onChange={(e) => handleTosConfigChange('region', e.target.value)}
                    >
                      <option value="cn-beijing">华北2（北京）</option>
                      <option value="cn-shanghai">华东2（上海）</option>
                      <option value="cn-guangzhou">华南1（广州）</option>
                    </Form.Select>
                    <Form.Text className="text-muted">
                      Bucket 所在区域
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <i className="bi bi-link-45deg me-1"></i>
                      自定义端点（可选）
                    </Form.Label>
                    <Form.Control
                      type="url"
                      placeholder="https://your-bucket.tos-cn-beijing.volces.com"
                      value={tosConfig.endpoint}
                      onChange={(e) => handleTosConfigChange('endpoint', e.target.value)}
                    />
                    <Form.Text className="text-muted">
                      留空则自动生成
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>

              <Alert variant="warning" className="py-2 px-3">
                <small>
                  <i className="bi bi-exclamation-triangle me-1"></i>
                  <strong>注意：</strong>
                  <ul className="mb-0 mt-2">
                    <li>需要使用与上方相同的 AccessKeyId 和 SecretAccessKey</li>
                    <li>确保AccessKey具有 TOS 的读写权限</li>
                    <li>建议配置 Bucket 的公共读权限，以便生成的URL可访问</li>
                  </ul>
                </small>
              </Alert>

              <div className="mt-3 text-end">
                <Button variant="info" onClick={handleSaveTosConfig}>
                  <i className="bi bi-save me-1"></i>保存 TOS 配置
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* Appearance Settings */}
        <Col md={6}>
          <Card className="feature-card mb-4">
            <Card.Header className="bg-primary text-white">
              <i className="bi bi-palette me-2"></i>
              Appearance
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Theme</Form.Label>
                <Form.Select 
                  value={settings.theme}
                  onChange={(e) => handleSettingChange('theme', e.target.value)}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto (System)</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Font Size</Form.Label>
                <Form.Select 
                  value={settings.fontSize}
                  onChange={(e) => handleSettingChange('fontSize', e.target.value)}
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Language</Form.Label>
                <Form.Select 
                  value={settings.language}
                  onChange={(e) => handleSettingChange('language', e.target.value)}
                >
                  <option value="en">English</option>
                  <option value="zh">中文</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                </Form.Select>
              </Form.Group>
            </Card.Body>
          </Card>
        </Col>

        {/* Behavior Settings */}
        <Col md={6}>
          <Card className="feature-card mb-4">
            <Card.Header className="bg-success text-white">
              <i className="bi bi-toggles me-2"></i>
              Behavior
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Check 
                  type="switch"
                  id="notifications-switch"
                  label="Enable Notifications"
                  checked={settings.notifications}
                  onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                />
                <Form.Text className="text-muted">
                  Receive desktop notifications for important events
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Check 
                  type="switch"
                  id="autosave-switch"
                  label="Auto Save"
                  checked={settings.autoSave}
                  onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
                />
                <Form.Text className="text-muted">
                  Automatically save changes every 30 seconds
                </Form.Text>
              </Form.Group>

              <div className="border rounded p-3 bg-light">
                <h6 className="mb-2">
                  <i className="bi bi-info-circle me-1"></i>
                  Current Settings Summary
                </h6>
                <ul className="list-unstyled mb-0 small">
                  <li><strong>Theme:</strong> {settings.theme}</li>
                  <li><strong>Font Size:</strong> {settings.fontSize}</li>
                  <li><strong>Language:</strong> {settings.language}</li>
                  <li><strong>Notifications:</strong> {settings.notifications ? 'Enabled' : 'Disabled'}</li>
                  <li><strong>Auto Save:</strong> {settings.autoSave ? 'Enabled' : 'Disabled'}</li>
                </ul>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Advanced Settings */}
      <Row>
        <Col>
          <Card className="feature-card mb-4">
            <Card.Header className="bg-warning text-dark">
              <i className="bi bi-tools me-2"></i>
              Advanced Settings
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Cache Size (MB)</Form.Label>
                    <Form.Control type="number" defaultValue="100" min="50" max="1000" />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Max Concurrent Tasks</Form.Label>
                    <Form.Control type="number" defaultValue="5" min="1" max="20" />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Backup Interval (hours)</Form.Label>
                    <Form.Control type="number" defaultValue="24" min="1" max="168" />
                  </Form.Group>
                </Col>
              </Row>

              <Alert variant="info" className="mt-3">
                <i className="bi bi-exclamation-triangle me-2"></i>
                <strong>Note:</strong> Advanced settings require application restart to take effect.
              </Alert>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Action Buttons */}
      <div className="d-flex gap-2 justify-content-end">
        <Button variant="outline-secondary" onClick={handleReset}>
          <i className="bi bi-arrow-clockwise me-1"></i>
          Reset to Defaults
        </Button>
        <Button variant="primary" className="btn-gradient" onClick={handleSave}>
          <i className="bi bi-check-lg me-1"></i>
          Save Settings
        </Button>
      </div>
    </div>
  );
}

export default Settings;
