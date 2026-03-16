import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import StatusBar from './components/StatusBar';
import Dashboard from './pages/Dashboard';
import LiveMonitoring from './pages/LiveMonitoring';
import VideoUpload from './pages/VideoUpload';
import Incidents from './pages/Incidents';
import CameraManagement from './pages/CameraManagement';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import { AlertProvider } from './context/AlertContext';
import './App.css';
import './styles/components.css';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  return (
    <AlertProvider>
      <Router>
        <div className="app">
          <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
          <div className="main-content">
            <StatusBar />
            <div className="content-area">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/live-monitoring" element={<LiveMonitoring />} />
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