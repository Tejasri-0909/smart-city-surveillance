import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Camera, 
  Upload, 
  AlertTriangle, 
  Settings, 
  BarChart3,
  MapPin 
} from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'live-monitoring', label: 'Live CCTV Monitoring', icon: Camera, path: '/live-monitoring' },
    { id: 'video-upload', label: 'Video Upload Analysis', icon: Upload, path: '/video-upload' },
    { id: 'incidents', label: 'Incidents', icon: AlertTriangle, path: '/incidents' },
    { id: 'camera-management', label: 'Camera Management', icon: MapPin, path: '/camera-management' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/analytics' },
    { id: 'settings', label: 'System Settings', icon: Settings, path: '/settings' },
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Smart City Surveillance</h2>
        <p>Command Center</p>
      </div>
      
      <nav className="nav-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || 
                          (location.pathname === '/' && item.path === '/dashboard');
          
          return (
            <div
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => handleNavigation(item.path)}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </div>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;