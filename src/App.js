import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Navbar, Nav, Card, Button, Alert, Badge, ProgressBar } from 'react-bootstrap';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import About from './components/About';
import ImageGenerator from './components/ImageGenerator';
import VideoGenerator from './components/VideoGenerator';
import MotionImitation from './components/MotionImitation';
import SmartSearch from './components/SmartSearch';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [electronInfo, setElectronInfo] = useState({});

  useEffect(() => {
    // Check if we're running in Electron
    if (window.electronAPI) {
      setElectronInfo({
        platform: window.electronAPI.platform,
        isElectron: true
      });
    } else {
      setElectronInfo({
        platform: 'web',
        isElectron: false
      });
    }
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard electronInfo={electronInfo} />;
      case 'image-generator':
        return <ImageGenerator />;
      case 'video-generator':
        return <VideoGenerator />;
      case 'motion-imitation':
        return <MotionImitation />;
      case 'smart-search':
        return <SmartSearch />;
      case 'settings':
        return <Settings />;
      case 'about':
        return <About electronInfo={electronInfo} />;
      default:
        return <Dashboard electronInfo={electronInfo} />;
    }
  };

  return (
    <div className="App">
      <Header />
      
      <Container fluid>
        <Row>
          <Col md={3} className="p-0">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          </Col>
          <Col md={9}>
            <div className="main-content">
              {renderContent()}
            </div>
          </Col>
        </Row>
      </Container>

      {/* Footer */}
      <footer className="bg-dark text-light text-center py-3 mt-4">
        <Container>
          <p className="mb-0">
            Built with ❤️ using Electron + React + Bootstrap
            {electronInfo.isElectron && (
              <Badge bg="success" className="ms-2">
                Running in Electron on {electronInfo.platform}
              </Badge>
            )}
          </p>
        </Container>
      </footer>
    </div>
  );
}

export default App;
