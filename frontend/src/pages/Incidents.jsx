import { useState, useEffect } from 'react';
import { Search, Filter, Download, Eye, CheckCircle, XCircle } from 'lucide-react';
import IncidentTable from '../components/IncidentTable';
import { useAlert } from '../context/AlertContext';

const Incidents = () => {
  const { incidents, updateIncidentStatus } = useAlert();
  const [filteredIncidents, setFilteredIncidents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    filterIncidents();
  }, [incidents, searchTerm, statusFilter, typeFilter]);

  const filterIncidents = () => {
    let filtered = [...incidents];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(incident =>
        incident.incident_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.camera_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(incident => incident.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(incident => incident.incident_type === typeFilter);
    }

    setFilteredIncidents(filtered);
  };

  const handleIncidentUpdate = (incidentId, newStatus) => {
    // Update the incident status in the AlertContext
    updateIncidentStatus(incidentId, newStatus);
    console.log(`Incident ${incidentId} status updated to: ${newStatus}`);
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
            <option value="Weapon Detected">Weapon Detected</option>
            <option value="Fire Detected">Fire Detected</option>
            <option value="Suspicious Activity">Suspicious Activity</option>
            <option value="Unauthorized Access">Unauthorized Access</option>
            <option value="Vandalism">Vandalism</option>
          </select>
        </div>
      </div>

      {/* Incidents Table */}
      <div className="incidents-table-section">
        <IncidentTable 
          incidents={filteredIncidents}
          onIncidentUpdate={handleIncidentUpdate}
        />
      </div>
    </div>
  );
};

export default Incidents;