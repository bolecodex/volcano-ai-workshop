import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import About from './components/About';
import ImageGenerator from './components/ImageGenerator';
import VideoGenerator from './components/VideoGenerator';
import MotionImitation from './components/MotionImitation';
import SmartSearch from './components/SmartSearch';
import InpaintingEditor from './components/InpaintingEditor';
import DigitalHuman from './components/DigitalHuman';
import VideoEditor from './components/VideoEditor';
import { webAPI } from './utils/apiClient';

// 设置全局 API 客户端
window.electronAPI = webAPI;

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [appInfo, setAppInfo] = useState({
    platform: 'web',
    isElectron: false,
    version: '2.0.0-web'
  });

  useEffect(() => {
    // 获取应用信息
    const fetchAppInfo = async () => {
      try {
        const result = await webAPI.getAppInfo();
        if (result.success) {
          setAppInfo(result.data);
        }
      } catch (error) {
        console.error('获取应用信息失败:', error);
      }
    };
    
    fetchAppInfo();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard appInfo={appInfo} />;
      case 'image-generator':
        return <ImageGenerator />;
      case 'inpainting-editor':
        return <InpaintingEditor />;
      case 'video-editor':
        return <VideoEditor />;
      case 'video-generator':
        return <VideoGenerator />;
      case 'motion-imitation':
        return <MotionImitation />;
      case 'digital-human':
        return <DigitalHuman />;
      case 'smart-search':
        return <SmartSearch />;
      case 'settings':
        return <Settings />;
      case 'about':
        return <About appInfo={appInfo} />;
      default:
        return <Dashboard appInfo={appInfo} />;
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
            🌋 火山AI创作工坊 Web版 v{appInfo.version} - 基于 React + Express + Bootstrap 构建
          </p>
        </Container>
      </footer>
    </div>
  );
}

export default App;
