import { useState } from 'react';
import { Save, Bell, Shield, Database, Wifi, Monitor } from 'lucide-react';

const Settings = () => {
  const [settings, setSettings] = useState({
    // Alert Settings
    alertSound: true,
    alertVolume: 75,
    emailNotifications: true,
    smsNotifications: false,
    alertThreshold: 'medium',
    
    // AI Detection Settings
    weaponDetection: true,
    fireDetection: true,
    suspiciousActivity: true,
    confidenceThreshold: 80,
    
    // System Settings
    recordingEnabled: true,
    recordingDuration: 30,
    storageLocation: '/var/surveillance/recordings',
    maxStorageSize: 500,
    
    // Network Settings
    streamQuality: 'high',
    maxConcurrentStreams: 10,
    networkTimeout: 30,
    
    // Display Settings
    theme: 'dark',
    refreshRate: 5,
    gridLayout: '3x2',
    showTimestamps: true
  });

  const [activeTab, setActiveTab] = useState('alerts');

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    // In a real app, this would save to backend
    console.log('Saving settings:', settings);
    alert('Settings saved successfully!');
  };

  const renderAlertsTab = () => (
    <div className="settings-section">
      <h3>Alert Configuration</h3>
      
      <div className="setting-group">
        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={settings.alertSound}
              onChange={(e) => handleSettingChange('alertSound', e.target.checked)}
            />
            Enable Alert Sound
          </label>
        </div>
        
        <div className="setting-item">
          <label>Alert Volume</label>
          <input
            type="range"
            min="0"
            max="100"
            value={settings.alertVolume}
            onChange={(e) => handleSettingChange('alertVolume', parseInt(e.target.value))}
          />
          <span>{settings.alertVolume}%</span>
        </div>
        
        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
            />
            Email Notifications
          </label>
        </div>
        
        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={settings.smsNotifications}
              onChange={(e) => handleSettingChange('smsNotifications', e.target.checked)}
            />
            SMS Notifications
          </label>
        </div>
        
        <div className="setting-item">
          <label>Alert Threshold</label>
          <select
            value={settings.alertThreshold}
            onChange={(e) => handleSettingChange('alertThreshold', e.target.value)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical Only</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderDetectionTab = () => (
    <div className="settings-section">
      <h3>AI Detection Settings</h3>
      
      <div className="setting-group">
        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={settings.weaponDetection}
              onChange={(e) => handleSettingChange('weaponDetection', e.target.checked)}
            />
            Weapon Detection
          </label>
        </div>
        
        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={settings.fireDetection}
              onChange={(e) => handleSettingChange('fireDetection', e.target.checked)}
            />
            Fire Detection
          </label>
        </div>
        
        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={settings.suspiciousActivity}
              onChange={(e) => handleSettingChange('suspiciousActivity', e.target.checked)}
            />
            Suspicious Activity Detection
          </label>
        </div>
        
        <div className="setting-item">
          <label>Confidence Threshold</label>
          <input
            type="range"
            min="50"
            max="95"
            value={settings.confidenceThreshold}
            onChange={(e) => handleSettingChange('confidenceThreshold', parseInt(e.target.value))}
          />
          <span>{settings.confidenceThreshold}%</span>
        </div>
      </div>
    </div>
  );

  const renderSystemTab = () => (
    <div className="settings-section">
      <h3>System Configuration</h3>
      
      <div className="setting-group">
        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={settings.recordingEnabled}
              onChange={(e) => handleSettingChange('recordingEnabled', e.target.checked)}
            />
            Enable Recording
          </label>
        </div>
        
        <div className="setting-item">
          <label>Recording Duration (seconds)</label>
          <input
            type="number"
            min="10"
            max="300"
            value={settings.recordingDuration}
            onChange={(e) => handleSettingChange('recordingDuration', parseInt(e.target.value))}
          />
        </div>
        
        <div className="setting-item">
          <label>Storage Location</label>
          <input
            type="text"
            value={settings.storageLocation}
            onChange={(e) => handleSettingChange('storageLocation', e.target.value)}
          />
        </div>
        
        <div className="setting-item">
          <label>Max Storage Size (GB)</label>
          <input
            type="number"
            min="100"
            max="2000"
            value={settings.maxStorageSize}
            onChange={(e) => handleSettingChange('maxStorageSize', parseInt(e.target.value))}
          />
        </div>
      </div>
    </div>
  );

  const renderNetworkTab = () => (
    <div className="settings-section">
      <h3>Network Settings</h3>
      
      <div className="setting-group">
        <div className="setting-item">
          <label>Stream Quality</label>
          <select
            value={settings.streamQuality}
            onChange={(e) => handleSettingChange('streamQuality', e.target.value)}
          >
            <option value="low">Low (480p)</option>
            <option value="medium">Medium (720p)</option>
            <option value="high">High (1080p)</option>
            <option value="ultra">Ultra (4K)</option>
          </select>
        </div>
        
        <div className="setting-item">
          <label>Max Concurrent Streams</label>
          <input
            type="number"
            min="1"
            max="50"
            value={settings.maxConcurrentStreams}
            onChange={(e) => handleSettingChange('maxConcurrentStreams', parseInt(e.target.value))}
          />
        </div>
        
        <div className="setting-item">
          <label>Network Timeout (seconds)</label>
          <input
            type="number"
            min="10"
            max="120"
            value={settings.networkTimeout}
            onChange={(e) => handleSettingChange('networkTimeout', parseInt(e.target.value))}
          />
        </div>
      </div>
    </div>
  );

  const renderDisplayTab = () => (
    <div className="settings-section">
      <h3>Display Settings</h3>
      
      <div className="setting-group">
        <div className="setting-item">
          <label>Theme</label>
          <select
            value={settings.theme}
            onChange={(e) => handleSettingChange('theme', e.target.value)}
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
            <option value="auto">Auto</option>
          </select>
        </div>
        
        <div className="setting-item">
          <label>Refresh Rate (seconds)</label>
          <input
            type="number"
            min="1"
            max="60"
            value={settings.refreshRate}
            onChange={(e) => handleSettingChange('refreshRate', parseInt(e.target.value))}
          />
        </div>
        
        <div className="setting-item">
          <label>Grid Layout</label>
          <select
            value={settings.gridLayout}
            onChange={(e) => handleSettingChange('gridLayout', e.target.value)}
          >
            <option value="2x2">2x2</option>
            <option value="3x2">3x2</option>
            <option value="3x3">3x3</option>
            <option value="4x3">4x3</option>
          </select>
        </div>
        
        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={settings.showTimestamps}
              onChange={(e) => handleSettingChange('showTimestamps', e.target.checked)}
            />
            Show Timestamps
          </label>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'alerts', label: 'Alerts', icon: Bell, component: renderAlertsTab },
    { id: 'detection', label: 'AI Detection', icon: Shield, component: renderDetectionTab },
    { id: 'system', label: 'System', icon: Database, component: renderSystemTab },
    { id: 'network', label: 'Network', icon: Wifi, component: renderNetworkTab },
    { id: 'display', label: 'Display', icon: Monitor, component: renderDisplayTab }
  ];

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h2>System Settings</h2>
        <p>Configure surveillance system parameters and preferences</p>
      </div>

      <div className="settings-layout">
        <div className="settings-tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="settings-content">
          {tabs.find(tab => tab.id === activeTab)?.component()}
          
          <div className="settings-actions">
            <button className="btn btn-secondary">Reset to Defaults</button>
            <button className="btn btn-primary" onClick={handleSave}>
              <Save size={16} />
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;