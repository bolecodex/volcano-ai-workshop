import React, { useState } from 'react';
import { Row, Col, Card, Form, Button, Alert, Badge } from 'react-bootstrap';

function Settings() {
  const [settings, setSettings] = useState({
    theme: 'light',
    notifications: true,
    autoSave: true,
    language: 'en',
    fontSize: 'medium'
  });

  const [showAlert, setShowAlert] = useState(false);

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
