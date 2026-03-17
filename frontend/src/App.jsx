import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AlertProvider } from './context/AlertContext';
import Sidebar from './components/Sidebar';
import StatusBar from './components/StatusBar';
import DeploymentStatus from './components/DeploymentStatus';
import Dashboard from './pages/Dashboard';
import LiveMonitoring from './pages/LiveMonitoring';
import CityMap from './pages/CityMap';
import VideoUpload from './pages/VideoUpload';
import Incidents from './pages/Incidents';
import CameraManagement from './pages/CameraManagement';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Login from './pages/Login';
import './App.css';
import './styles/components.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <Router>
        <Login onLogin={handleLogin} />
      </Router>
    );
  }

  return (
    <AlertProvider>
      <Router>
        <div className="app">
          <DeploymentStatus />
          <Sidebar onLogout={handleLogout} />
          <div className="main-content">
            <StatusBar />
            <div className="content-area">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/live-monitoring" element={<LiveMonitoring />} />
                <Route path="/city-map" element={<CityMap />} />
                <Route path="/video-upload" element={<VideoUpload />} />
                <Route path="/incidents" element={<Incidents />} />
                <Route path="/camera-management" element={<CameraManagement />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </div>
          </div>
        </div>
      </Router>
    </AlertProvider>
  );
}

export default App;