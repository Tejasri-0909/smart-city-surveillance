import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, AlertTriangle, Camera, MapPin } from 'lucide-react';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    generateAnalyticsData();
  }, [timeRange]);

  const generateAnalyticsData = () => {
    // Simulate analytics data
    const incidentsByType = [
      { name: 'Weapon Detected', value: 15, color: '#ff4444' },
      { name: 'Suspicious Activity', value: 32, color: '#ffaa00' },
      { name: 'Fire Detected', value: 8, color: '#ff6600' },
      { name: 'Unauthorized Access', value: 12, color: '#aa44ff' }
    ];

    const incidentsByLocation = [
      { location: 'City Center', incidents: 18 },
      { location: 'Metro Station', incidents: 25 },
      { location: 'Airport Gate', incidents: 12 },
      { location: 'Shopping Mall', incidents: 8 },
      { location: 'Park Entrance', incidents: 4 }
    ];

    const incidentsOverTime = [
      { date: '2024-03-10', incidents: 5 },
      { date: '2024-03-11', incidents: 8 },
      { date: '2024-03-12', incidents: 12 },
      { date: '2024-03-13', incidents: 6 },
      { date: '2024-03-14', incidents: 15 },
      { date: '2024-03-15', incidents: 9 },
      { date: '2024-03-16', incidents: 11 }
    ];

    const cameraPerformance = [
      { camera: 'CAM001', uptime: 98.5, incidents: 12 },
      { camera: 'CAM002', uptime: 95.2, incidents: 18 },
      { camera: 'CAM003', uptime: 99.1, incidents: 8 },
      { camera: 'CAM004', uptime: 97.8, incidents: 6 },
      { camera: 'CAM005', uptime: 89.3, incidents: 3 },
      { camera: 'CAM006', uptime: 96.7, incidents: 10 }
    ];

    setAnalyticsData({
      incidentsByType,
      incidentsByLocation,
      incidentsOverTime,
      cameraPerformance,
      summary: {
        totalIncidents: 67,
        avgResponseTime: '2.3 min',
        systemUptime: 96.8,
        falseAlarmRate: 12.5
      }
    });
  };

  if (!analyticsData) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <span>Loading analytics...</span>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <div>
          <h2>Analytics Dashboard</h2>
          <p>Comprehensive insights into surveillance system performance</p>
        </div>
        
        <div className="time-range-selector">
          <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="analytics-summary">
        <div className="summary-card">
          <div className="summary-icon incidents">
            <AlertTriangle size={24} />
          </div>
          <div className="summary-content">
            <div className="summary-number">{analyticsData.summary.totalIncidents}</div>
            <div className="summary-label">Total Incidents</div>
            <div className="summary-trend positive">+12% from last period</div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon response">
            <TrendingUp size={24} />
          </div>
          <div className="summary-content">
            <div className="summary-number">{analyticsData.summary.avgResponseTime}</div>
            <div className="summary-label">Avg Response Time</div>
            <div className="summary-trend negative">-8% from last period</div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon uptime">
            <Camera size={24} />
          </div>
          <div className="summary-content">
            <div className="summary-number">{analyticsData.summary.systemUptime}%</div>
            <div className="summary-label">System Uptime</div>
            <div className="summary-trend positive">+2% from last period</div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon false-alarm">
            <MapPin size={24} />
          </div>
          <div className="summary-content">
            <div className="summary-number">{analyticsData.summary.falseAlarmRate}%</div>
            <div className="summary-label">False Alarm Rate</div>
            <div className="summary-trend negative">-5% from last period</div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="analytics-charts">
        {/* Incidents Over Time */}
        <div className="chart-container">
          <h3>Incidents Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData.incidentsOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
              <XAxis dataKey="date" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip 
                contentStyle={{ 
                  background: '#1a1a2e', 
                  border: '1px solid #2a2a3e',
                  borderRadius: '8px'
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="incidents" 
                stroke="#00d4ff" 
                strokeWidth={3}
                dot={{ fill: '#00d4ff', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Incidents by Type */}
        <div className="chart-container">
          <h3>Incidents by Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analyticsData.incidentsByType}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {analyticsData.incidentsByType.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  background: '#1a1a2e', 
                  border: '1px solid #2a2a3e',
                  borderRadius: '8px'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Incidents by Location */}
        <div className="chart-container">
          <h3>Incidents by Location</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.incidentsByLocation}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
              <XAxis dataKey="location" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip 
                contentStyle={{ 
                  background: '#1a1a2e', 
                  border: '1px solid #2a2a3e',
                  borderRadius: '8px'
                }} 
              />
              <Bar dataKey="incidents" fill="#00d4ff" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Camera Performance */}
        <div className="chart-container">
          <h3>Camera Performance</h3>
          <div className="camera-performance-table">
            <table>
              <thead>
                <tr>
                  <th>Camera</th>
                  <th>Uptime</th>
                  <th>Incidents</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.cameraPerformance.map((camera) => (
                  <tr key={camera.camera}>
                    <td>{camera.camera}</td>
                    <td>
                      <div className="uptime-bar">
                        <div 
                          className="uptime-fill" 
                          style={{ width: `${camera.uptime}%` }}
                        ></div>
                        <span>{camera.uptime}%</span>
                      </div>
                    </td>
                    <td>{camera.incidents}</td>
                    <td>
                      <span className={`status-badge ${camera.uptime > 95 ? 'active' : 'warning'}`}>
                        {camera.uptime > 95 ? 'Good' : 'Needs Attention'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;