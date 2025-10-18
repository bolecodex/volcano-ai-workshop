import React from 'react';
import { Nav } from 'react-bootstrap';

function Sidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: 'dashboard', label: '工作台', icon: 'bi-speedometer2' },
    { id: 'image-generator', label: 'AI 图片生成', icon: 'bi-image' },
    { id: 'inpainting-editor', label: '智能绘图', icon: 'bi-brush' },
    { id: 'video-generator', label: 'AI 视频生成', icon: 'bi-camera-video' },
    { id: 'video-editor', label: '视频编辑', icon: 'bi-film' },
    { id: 'motion-imitation', label: '动作模仿', icon: 'bi-person-video2' },
    { id: 'digital-human', label: '数字人', icon: 'bi-person-video3' },
    { id: 'smart-search', label: '素材搜索', icon: 'bi-search-heart' },
    { id: 'settings', label: '设置', icon: 'bi-gear' },
    { id: 'about', label: '关于', icon: 'bi-info-circle' }
  ];

  return (
    <div className="sidebar">
      <div className="p-3">
        <h5 className="text-white mb-3">
          <i className="bi bi-list me-2"></i>
          导航菜单
        </h5>
        <Nav className="flex-column">
          {menuItems.map((item) => (
            <Nav.Link
              key={item.id}
              className={`d-flex align-items-center py-2 px-3 rounded mb-1 ${
                activeTab === item.id ? 'active' : ''
              }`}
              onClick={() => setActiveTab(item.id)}
              style={{ cursor: 'pointer' }}
            >
              <i className={`${item.icon} me-2`}></i>
              {item.label}
            </Nav.Link>
          ))}
        </Nav>
      </div>
      
      <div className="p-3 border-top border-secondary mt-auto">
        <div className="d-flex align-items-center">
          <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-2" 
               style={{ width: '32px', height: '32px' }}>
            <i className="bi bi-person text-white"></i>
          </div>
          <div>
            <div className="text-white small fw-bold">用户</div>
            <div className="text-muted small">管理员</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
