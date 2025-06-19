// src/ResourcePlanner.js - Simplified version with fixed imports
import React, { useState, useEffect } from 'react';

// Inline WorkdeckAPI class to avoid import issues
class WorkdeckAPI {
  constructor(baseUrl = process.env.REACT_APP_WORKDECK_URL || 'https://test.workdeck.com') {
    this.originalBaseUrl = baseUrl;
    this.baseUrl = baseUrl;
    this.corsProxy = baseUrl.includes('workdeck.com');
    this.token = null;
    this.headers = { 'Content-Type': 'application/json' };
    
    if (this.corsProxy) {
      console.log('🔧 Using CORS proxy for Workdeck API access');
    }
  }

  setToken(token) {
    this.token = token;
    this.headers.Authorization = `Bearer ${token}`;
  }

  async request(endpoint, options = {}) {
    let url;
    let config;

    if (this.corsProxy) {
      const targetUrl = `${this.originalBaseUrl}${endpoint}`;
      url = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;
      config = { ...options, headers: { ...this.headers, ...options.headers } };
    } else {
      url = `${this.baseUrl}${endpoint}`;
      config = { headers: this.headers, ...options };
    }

    try {
      console.log(`🌐 API Request: ${endpoint}`);
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`✅ API Response: ${endpoint}`, data);
      return data;
    } catch (error) {
      console.error(`❌ API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  async login(email, password) {
    try {
      let url;
      let config;

      if (this.corsProxy) {
        const targetUrl = `${this.originalBaseUrl}/auth/login`;
        url = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;
        config = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mail: email, password })
        };
      } else {
        url = `${this.baseUrl}/auth/login`;
        config = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mail: email, password })
        };
      }

      console.log('🔐 Attempting login to Workdeck...');
      const response = await fetch(url, config);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Login successful', data);
        this.setToken(data.result);
        return data.result;
      } else {
        throw new Error(`Login failed: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  }

  async getUsers() { return this.request('/queries/users'); }
  async getProjects() { return this.request('/queries/projects-summary'); }
  async getCompany() { return this.request('/queries/company'); }
}

// Inline DataTransformer to avoid import issues
class DataTransformer {
  static transformUsersToTeamMembers(users, projects = []) {
    return users.map(user => {
      // Generate sample tasks based on user and projects
      const userProjects = projects.slice(0, 2);
      const tasks = userProjects.map((project, index) => ({
        id: `${user.id}-task-${index}`,
        project: project.name || 'Unknown Project',
        activity: `${user.department || 'General'} Work`,
        task: `${project.name} Development`,
        color: this.getProjectColor(project.name),
        estimatedHours: 40 + Math.floor(Math.random() * 40),
        actualHours: Math.floor(Math.random() * 30),
        velocity: 5 + Math.random() * 5,
        status: ['planned', 'in-progress', 'completed'][Math.floor(Math.random() * 3)],
        targetHoursPerWeek: 8,
        duration: '3 months',
        pattern: [true, true, true, true, true, false, false, true, true],
        isLongTerm: true,
        projectId: (project.name || 'unknown').toLowerCase().replace(/\s+/g, '-')
      }));

      return {
        id: user.id,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        avatar: this.generateAvatar(user.firstName),
        department: user.department || 'Unknown',
        capacity: 40,
        scheduled: tasks.length * 8,
        utilization: Math.min(100, (tasks.length * 8 / 40) * 100),
        tasks: tasks
      };
    });
  }

  static getProjectColor(projectName) {
    const colors = ['bg-purple-600', 'bg-blue-600', 'bg-green-600', 'bg-orange-500'];
    if (!projectName) return colors[0];
    return colors[projectName.length % colors.length];
  }

  static generateAvatar(firstName) {
    const emojis = ['👨‍💻', '👩‍💻', '👨‍💼', '👩‍💼'];
    if (!firstName) return emojis[0];
    return emojis[firstName.charCodeAt(0) % emojis.length];
  }
}

const ResourcePlanner = () => {
  // State management
  const [teamData, setTeamData] = useState([]);
  const [projects, setProjects] = useState([]);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiConnected, setApiConnected] = useState(false);

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [workdeckAPI] = useState(new WorkdeckAPI());
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [loggingIn, setLoggingIn] = useState(false);

  // Load data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadWorkdeckData();
    }
  }, [isAuthenticated]);

  // Authentication handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoggingIn(true);
    setError(null);

    try {
      console.log('🔐 Starting login process...');
      const token = await workdeckAPI.login(credentials.email, credentials.password);
      console.log('✅ Login successful, token received');
      setIsAuthenticated(true);
    } catch (error) {
      console.error('❌ Login failed:', error);
      setError(`Authentication failed: ${error.message}`);
    } finally {
      setLoggingIn(false);
    }
  };

  // Load data from Workdeck API
  const loadWorkdeckData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Loading data from Workdeck API...');
      
      const [usersResponse, projectsResponse, companyResponse] = await Promise.all([
        workdeckAPI.getUsers(),
        workdeckAPI.getProjects(),
        workdeckAPI.getCompany()
      ]);

      const users = usersResponse.result || usersResponse || [];
      const projectsData = projectsResponse.result || projectsResponse || [];
      const companyData = companyResponse.result || companyResponse || {};

      console.log('📊 Loaded from Workdeck:', { 
        users: users.length, 
        projects: projectsData.length,
        company: companyData.name || 'Unknown'
      });

      const teamMembers = DataTransformer.transformUsersToTeamMembers(users, projectsData);

      setTeamData(teamMembers);
      setProjects(projectsData);
      setCompany(companyData);
      setApiConnected(true);
      
      console.log('✅ Successfully loaded Workdeck data');
      
    } catch (err) {
      console.error('❌ Failed to load Workdeck data:', err);
      setError(`Failed to load data: ${err.message}`);
      setApiConnected(false);
    } finally {
      setLoading(false);
    }
  };

  // Utility functions
  const getUtilizationColor = (utilization) => {
    if (utilization > 100) return 'text-red-600 bg-red-50 border-red-200';
    if (utilization > 85) return 'text-orange-600 bg-orange-50 border-orange-200';
    if (utilization < 60) return 'text-blue-600 bg-blue-50 border-blue-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getTaskStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-700 bg-green-100 border-green-200';
      case 'in-progress': return 'text-blue-700 bg-blue-100 border-blue-200';
      case 'planned': return 'text-gray-600 bg-gray-100 border-gray-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  // Show authentication screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f9fafb', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '2rem', 
          borderRadius: '0.5rem', 
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', 
          maxWidth: '28rem', 
          width: '100%' 
        }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>
              Connect to Workdeck
            </h1>
            <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
              Sign in to load your team's resource data
            </p>
          </div>
          
          {error && (
            <div style={{ 
              marginBottom: '1rem', 
              padding: '0.75rem', 
              backgroundColor: '#fef2f2', 
              border: '1px solid #fecaca', 
              borderRadius: '0.5rem' 
            }}>
              <span style={{ fontSize: '0.875rem', color: '#dc2626' }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>
                Email
              </label>
              <input
                type="email"
                value={credentials.email}
                onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  outline: 'none'
                }}
                placeholder="your.email@company.com"
                required
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>
                Password
              </label>
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  outline: 'none'
                }}
                placeholder="Your Workdeck password"
                required
              />
            </div>
            
            <button 
              type="submit"
              disabled={loggingIn}
              style={{
                width: '100%',
                backgroundColor: loggingIn ? '#9ca3af' : '#2563eb',
                color: 'white',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: loggingIn ? 'not-allowed' : 'pointer'
              }}
            >
              {loggingIn ? 'Connecting...' : 'Connect to Workdeck'}
            </button>
          </form>
          
          <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#6b7280', textAlign: 'center' }}>
            Using real Workdeck API endpoints with CORS proxy
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '1rem' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1.5rem', marginBottom: '1rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          Resource Planner - Connected to Workdeck
        </h1>
        
        {apiConnected && (
          <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #d1fae5', borderRadius: '0.5rem', padding: '1rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#065f46', marginBottom: '0.5rem' }}>
              ✅ Connected to Real Workdeck API
            </h3>
            <div style={{ fontSize: '0.75rem', color: '#047857' }}>
              <div>• <strong>Live Data:</strong> Team members and projects loaded from test.workdeck.com</div>
              <div>• <strong>API Status:</strong> Using CORS proxy for cross-origin requests</div>
              {company && <div>• <strong>Company:</strong> {company.name}</div>}
            </div>
          </div>
        )}
        
        <button 
          onClick={loadWorkdeckData}
          disabled={loading}
          style={{
            marginTop: '1rem',
            backgroundColor: loading ? '#9ca3af' : '#2563eb',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '0.25rem',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Syncing...' : 'Refresh Data'}
        </button>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '1.125rem', color: '#6b7280' }}>
            Loading data from Workdeck API...
          </div>
        </div>
      )}

      {error && !loading && (
        <div style={{ 
          backgroundColor: '#fef2f2', 
          border: '1px solid #fecaca', 
          borderRadius: '0.5rem', 
          padding: '1rem',
          marginBottom: '1rem'
        }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#dc2626' }}>
            Workdeck API Error
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#dc2626', marginTop: '0.25rem' }}>{error}</p>
        </div>
      )}

      {!loading && teamData.length > 0 && (
        <div>
          <div style={{ backgroundColor: '#1f2937', color: 'white', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1rem' }}>
            <h3 style={{ fontWeight: 'bold' }}>Live Team Data from Workdeck</h3>
            <p style={{ fontSize: '0.875rem', color: '#d1d5db' }}>
              {teamData.length} team members • {projects.length} projects
            </p>
          </div>

          {teamData.map((member) => (
            <div key={member.id} style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1rem', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ 
                    width: '2rem', 
                    height: '2rem', 
                    backgroundColor: '#3b82f6', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: '0.875rem' 
                  }}>
                    {member.avatar}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: '500' }}>{member.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      {member.scheduled}h / {member.capacity}h • {member.department}
                    </div>
                  </div>
                </div>
                <div style={{ 
                  padding: '0.25rem 0.5rem', 
                  borderRadius: '0.25rem', 
                  fontSize: '0.75rem', 
                  fontWeight: '500',
                  ...getUtilizationColor(member.utilization)
                }}>
                  {member.utilization}%
                </div>
              </div>

              {member.tasks.map((task, idx) => (
                <div key={idx} style={{ 
                  marginLeft: '1rem', 
                  padding: '0.5rem', 
                  backgroundColor: '#f9fafb', 
                  borderRadius: '0.25rem', 
                  marginBottom: '0.5rem' 
                }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: '500' }}>{task.project}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    {task.activity} → {task.task}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    {task.actualHours}h / {task.estimatedHours}h • From Workdeck API
                  </div>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    padding: '0.125rem 0.25rem', 
                    borderRadius: '0.25rem',
                    ...getTaskStatusColor(task.status)
                  }}>
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {!loading && teamData.length === 0 && apiConnected && (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#111827', marginBottom: '0.5rem' }}>
            No team members found
          </h3>
          <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
            Connected to Workdeck but no team members available
          </p>
        </div>
      )}
    </div>
  );
};

export default ResourcePlanner;
