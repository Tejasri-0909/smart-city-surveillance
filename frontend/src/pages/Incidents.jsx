import { useState, useEffect } from 'react';
import { Search, Filter, Download, Eye, CheckCircle, XCircle } from 'lucide-react';
import IncidentTable from '../components/IncidentTable';
import axios from 'axios';

const Incidents = () => {
  const [incidents, setIncidents] = useState([]);
  const [filteredIncidents, setFilteredIncidents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIncidents();
  }, []);

  useEffect(() => {
    filterIncidents();
  }, [incidents, searchTerm, statusFilter, typeFilter]);

  const fetchIncidents = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/incidents');
      setIncidents(response.data.incidents);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching incidents:', error);
      // Use sample data for demo
      const sampleIncidents = [
        {
          id: 1,
          camera_id: 'CAM002',
          incident_type: 'Weapon Detected',
          location: 'Metro Station',
          timestamp: new Date(Date.now() - 300000).toISOString(),
          status: 'active',
          severity: 'high',
          description: 'Suspicious weapon detected in crowd'
        },
        {
          id: 2,
          camera_id: 'CAM001',
          incident_type: 'Suspicious Activity',
          location: 'City Center',
          timestamp: new Date(Date.now() - 600000).toISOString(),
          status: 'resolved',
          severity: 'medium',
          description: 'Unusual behavior pattern detected'
        },
        {
          id: 3,
          camera_id: 'CAM003',
          incident_type: 'Fire Detected',
          location: 'Airport Gate',
          timestamp: new Date(Date.now() - 900000).toISOString(),
          status: 'false-alarm',
          severity: 'critical',
          description: 'Heat signature detected, later confirmed as false alarm'
        }
      ];
      setIncidents(sampleIncidents);
      setLoading(false);
    }
  };

  const filterIncidents = () => {
    let filtered = incidents;

    if (searchTerm) {
      filtered = filtered.filter(incident =>
        incident.camera_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.incident_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(incident => incident.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(incident => 
        incident.incident_type.toLowerCase().includes(typeFilter.toLowerCase())
      );
    }

    setFilteredIncidents(filtered);
  };

  const updateIncidentStatus = async (incidentId, newStatus) => {
    try {
      // In a real app, this would make an API call
      setIncidents(prev => 
        prev.map(incident => 
          incident.id === incidentId 
            ? { ...incident, status: newStatus }
            : incident
        )
      );
    } catch (error) {
      console.error('Error updating incident status:', error);
    }
  };

  const exportIncidents = () => {
    const csvContent = [
      ['Camera ID', 'Incident Type', 'Location', 'Timestamp', 'Status', 'Severity'],
      ...filteredIncidents.map(incident => [
        incident.camera_id,
        incident.incident_type,
        incident.location,
        new Date(incident.timestamp).toLocaleString(),
        incident.status,
        incident.severity
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `incidents_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getIncidentStats = () => {
    const total = incidents.length;
    const active = incidents.filter(i => i.status === 'active').length;
    const resolved = incidents.filter(i => i.status === 'resolved').length;
    const falseAlarms = incidents.filter(i => i.status === 'false-alarm').length;

    return { total, active, resolved, falseAlarms };
  };

  const stats = getIncidentStats();

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <span>Loading incidents...</span>
      </div>
    );
  }

  return (
    <div className="incidents-page">
      <div className="incidents-header">
        <div>
          <h2>Incident Management</h2>
          <p>Monitor and manage security incidents across all camera locations</p>
        </div>
        
        <button 
          className="btn btn-primary"
          onClick={exportIncidents}
        >
          <Download size={16} />
          Export Report
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="incident-stats">
        <div className="stat-card">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total Incidents</div>
        </div>
        <div className="stat-card alert">
          <div className="stat-number">{stats.active}</div>
          <div className="stat-label">Active</div>
        </div>
        <div className="stat-card success">
          <div className="stat-number">{stats.resolved}</div>
          <div className="stat-label">Resolved</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-number">{stats.falseAlarms}</div>
          <div className="stat-label">False Alarms</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="incidents-controls">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search incidents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-controls">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="resolved">Resolved</option>
            <option value="false-alarm">False Alarm</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="weapon">Weapon Detected</option>
            <option value="fire">Fire Detected</option>
            <option value="suspicious">Suspicious Activity</option>
          </select>
        </div>
      </div>

      {/* Incidents Table */}
      <div className="incidents-table-section">
        <IncidentTable 
          incidents={filteredIncidents}
          onStatusUpdate={updateIncidentStatus}
        />
      </div>
    </div>
  );
};

export default Incidents;