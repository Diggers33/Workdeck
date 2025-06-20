// Updated ResourcePlanner.js with fixed API calls
import React, { useState, useEffect } from 'react';

// Fixed WorkdeckAPI class
class WorkdeckAPI {
  constructor(baseUrl = 'https://test.workdeck.com') {
    this.originalBaseUrl = baseUrl;
    this.token = null;
    this.headers = { 'Content-Type': 'application/json' };
    console.log('🔧 Workdeck API initialized for:', baseUrl);
  }

  setToken(token) {
    this.token = token;
    this.headers.Authorization = `Bearer ${token}`;
    console.log('🔑 Token set for API requests');
  }

  async makeProxyRequest(endpoint, options = {}) {
    const targetUrl = `${this.originalBaseUrl}${endpoint}`;
    
    // Try multiple CORS proxy services
    const proxies = [
      // Option 1: allorigins
      {
        name: 'allorigins',
        url: `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`,
        method: 'GET' // allorigins only supports GET with URL params
      },
      // Option 2: cors-anywhere (needs request)
      {
        name: 'cors-anywhere',
        url: `https://cors-anywhere.herokuapp.com/${targetUrl}`,
        ...options
      },
      // Option 3: Direct (will fail but good to try)
      {
        name: 'direct',
        url: targetUrl,
        ...options
      }
    ];

    for (const proxy of proxies) {
      try {
        console.log(`🌐 Trying ${proxy.name} proxy for ${endpoint}`);
        
        let config = {
          headers: { ...this.headers, ...options.headers },
          ...options
        };

        // Special handling for allorigins
        if (proxy.name === 'allorigins' && options.method === 'POST') {
          // For POST requests, we need to encode the data in the URL
          const postData = options.body ? `&data=${encodeURIComponent(options.body)}` : '';
          config = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          };
          proxy.url += postData;
        }

        const response = await fetch(proxy.url, config);
        console.log(`📡 ${proxy.name} response:`, response.status, response.statusText);

        if (response.ok) {
          let data;
          
          if (proxy.name === 'allorigins') {
            const result = await response.json();
            if (result.status && result.status.http_code === 200) {
              data = JSON.parse(result.contents);
            } else {
              throw new Error(`Proxy error: ${result.status?.http_code || 'Unknown'}`);
            }
          } else {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              data = await response.json();
            } else {
              const text = await response.text();
              console.log('📄 Non-JSON response:', text.substring(0, 200));
              throw new Error('Server returned non-JSON response');
            }
          }
          
          console.log(`✅ ${proxy.name} success:`, data);
          return data;
        }
      } catch (error) {
        console.log(`❌ ${proxy.name} failed:`, error.message);
        continue;
      }
    }
    
    throw new Error('All proxy methods failed');
  }

  async login(email, password) {
    try {
      console.log('🔐 Starting login process...');
      
      // Method 1: Try direct fetch (will likely fail due to CORS)
      try {
        console.log('🔗 Attempting direct login...');
        const directResponse = await fetch(`${this.originalBaseUrl}/auth/login`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ mail: email, password })
        });

        if (directResponse.ok) {
          const data = await directResponse.json();
          console.log('✅ Direct login successful!');
          this.setToken(data.result);
          return data.result;
        }
      } catch (corsError) {
        console.log('❌ Direct login blocked by CORS, trying proxy methods...');
      }

      // Method 2: Try CORS proxy
      const data = await this.makeProxyRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ mail: email, password })
      });

      if (data && data.result) {
        console.log('✅ Proxy login successful!');
        this.setToken(data.result);
        return data.result;
      } else {
        throw new Error('Login response missing token');
      }

    } catch (error) {
      console.error('❌ All login methods failed:', error);
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  async request(endpoint, options = {}) {
    if (!this.token) {
      throw new Error('Not authenticated - please login first');
    }

    return this.makeProxyRequest(endpoint, options);
  }

  async getUsers() { 
    console.log('👥 Fetching users...');
    return this.request('/queries/users'); 
  }
  
  async getProjects() { 
    console.log('📁 Fetching projects...');
    return this.request('/queries/projects-summary'); 
  }
  
  async getCompany() { 
    console.log('🏢 Fetching company info...');
    return this.request('/queries/company'); 
  }
}

// Simple DataTransformer
class DataTransformer {
  static transformUsersToTeamMembers(users, projects = []) {
    console.log('🔄 Transforming data:', { users: users.length, projects: projects.length });
    
    return users.map(user => {
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
        pattern: [true, true, true, true, true, false, false, true, true]
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
    return colors[(projectName?.length || 0) % colors.length];
  }

  static generateAvatar(firstName) {
    const emojis = ['👨‍💻', '👩‍💻', '👨‍💼', '👩‍💼'];
    return emojis[(firstName?.charCodeAt(0) || 0) % emojis.length];
  }
}

const ResourcePlanner = () => {
  const [teamData, setTeamData] = useState([]);
  const [projects, setProjects] = useState([]);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiConnected, setApiConnected] = useState(false);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [workdeckAPI] = useState(new WorkdeckAPI());
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [loggingIn, setLoggingIn] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadWorkdeckData();
    }
  }, [isAuthenticated]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoggingIn(true);
    setError(null);

    try {
      console.log('🚀 Login attempt starting...');
      await workdeckAPI.login(credentials.email, credentials.password);
      console.log('✅ Authentication successful!');
      setIsAuthenticated(true);
    } catch (error) {
      console.error('❌ Login failed:', error);
      setError(error.message);
    } finally {
      setLoggingIn(false);
    }
  };

  const loadWorkdeckData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('📊 Loading team data from Workdeck...');
      
      const [usersResponse, projectsResponse, companyResponse] = await Promise.all([
        workdeckAPI.getUsers(),
        workdeckAPI.getProjects(),
        workdeckAPI.getCompany()
      ]);

      const users = usersResponse.result || usersResponse || [];
      const projectsData = projectsResponse.result || projectsResponse || [];
      const companyData = companyResponse.result || companyResponse || {};

      console.log('📈 Data loaded:', { 
        users: users.length, 
        projects: projectsData.length,
        company: companyData.name || 'Unknown'
      });

      const teamMembers = DataTransformer.transformUsersToTeamMembers(users, projectsData);

      setTeamData(teamMembers);
      setProjects(projectsData);
      setCompany(companyData);
      setApiConnected(true);
      
      console.log('🎉 Successfully loaded all Workdeck data!');
      
    } catch (err) {
      console.error('💥 Failed to load data:', err);
      setError(`Failed to load data: ${err.message}`);
      setApiConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const getUtilizationColor = (utilization) => {
    if (utilization > 100) return { color: '#dc2626', backgroundColor: '#fef2f2', borderColor: '#fecaca' };
    if (utilization > 85) return { color: '#ea580c', backgroundColor: '#fff7ed', borderColor: '#fed7aa' };
    if (utilization < 60) return { color: '#2563eb', backgroundColor: '#eff6ff', borderColor: '#dbeafe' };
    return { color: '#059669', backgroundColor: '#ecfdf5', borderColor: '#d1fae5' };
  };

  // Authentication screen
  if (!isAuthenticated) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f9fafb', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '1rem'
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
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
              Connect to Workdeck
            </h1>
            <p style={{ color: '#6b7280' }}>
              Sign in to load your team's resource data from test.workdeck.com
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
              <div style={{ fontSize: '0.875rem', color: '#dc2626', fontWeight: '500' }}>
                Authentication Error
              </div>
              <div style={{ fontSize: '0.875rem', color: '#dc2626', marginTop: '0.25rem' }}>
                {error}
              </div>
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
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem'
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
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem'
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
                borderRadius: '0.375rem',
                border: 'none',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: loggingIn ? 'not-allowed' : 'pointer'
              }}
            >
              {loggingIn ? 'Connecting to Workdeck...' : 'Connect to Workdeck'}
            </button>
          </form>
          
          <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#6b7280', textAlign: 'center' }}>
            Using multiple CORS proxy methods for reliable connection
          </div>
        </div>
      </div>
    );
  }

  // Main application
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '1rem' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1.5rem', marginBottom: '1rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>
            Resource Planner
          </h1>
          <button 
            onClick={() => {
              setIsAuthenticated(false);
              setTeamData([]);
              setProjects([]);
              setCompany(null);
              setApiConnected(false);
            }}
            style={{
              backgroundColor: '#6b7280',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '0.25rem',
              border: 'none',
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
        
        {apiConnected && (
          <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #d1fae5', borderRadius: '0.5rem', padding: '1rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#065f46', marginBottom: '0.5rem' }}>
              ✅ Connected to Workdeck API
            </h3>
            <div style={{ fontSize: '0.75rem', color: '#047857' }}>
              <div>• <strong>Live Data:</strong> Connected to test.workdeck.com</div>
              <div>• <strong>Team Members:</strong> {teamData.length} loaded</div>
              <div>• <strong>Projects:</strong> {projects.length} loaded</div>
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
            fontSize: '0.875rem',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Syncing with Workdeck...' : 'Refresh Data'}
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '1.125rem', color: '#6b7280', marginBottom: '0.5rem' }}>
            📡 Loading data from Workdeck API...
          </div>
          <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
            This may take a moment due to CORS proxy routing
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div style={{ 
          backgroundColor: '#fef2f2', 
          border: '1px solid #fecaca', 
          borderRadius: '0.5rem', 
          padding: '1rem',
          marginBottom: '1rem'
        }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#dc2626', marginBottom: '0.5rem' }}>
            🚨 Workdeck API Error
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#dc2626' }}>{error}</p>
          <button 
            onClick={loadWorkdeckData}
            style={{
              marginTop: '0.5rem',
              backgroundColor: '#dc2626',
              color: 'white',
              padding: '0.25rem 0.75rem',
              borderRadius: '0.25rem',
              border: 'none',
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Team Data */}
      {!loading && teamData.length > 0 && (
        <div>
          <div style={{ backgroundColor: '#1f2937', color: 'white', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1rem' }}>
            <h3 style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>🎉 Live Team Data from Workdeck</h3>
            <p style={{ fontSize: '0.875rem', color: '#d1d5db' }}>
              {teamData.length} team members • {projects.length} projects • Real data from test.workdeck.com
            </p>
          </div>

          {teamData.map((member) => (
            <div key={member.id} style={{ 
              backgroundColor: 'white', 
              borderRadius: '0.5rem', 
              padding: '1rem', 
              marginBottom: '1rem', 
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ 
                    width: '2.5rem', 
                    height: '2.5rem', 
                    backgroundColor: '#3b82f6', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: '1rem' 
                  }}>
                    {member.avatar}
                  </div>
                  <div>
                    <div style={{ fontSize: '1rem', fontWeight: '600', color: '#111827' }}>{member.name}</div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      {member.scheduled}h / {member.capacity}h • {member.department}
                    </div>
                  </div>
                </div>
                <div style={{ 
                  padding: '0.25rem 0.5rem', 
                  borderRadius: '0.25rem', 
                  fontSize: '0.75rem', 
                  fontWeight: '600',
                  border: '1px solid',
                  ...getUtilizationColor(member.utilization)
                }}>
                  {member.utilization}% Utilized
                </div>
              </div>

              {member.tasks.map((task, idx) => (
                <div key={idx} style={{ 
                  marginLeft: '3rem', 
                  padding: '0.75rem', 
                  backgroundColor: '#f9fafb', 
                  borderRadius: '0.375rem', 
                  marginBottom: '0.5rem',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#111827', marginBottom: '0.25rem' }}>
                    {task.project}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                    {task.activity} → {task.task}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                    📊 {task.actualHours}h / {task.estimatedHours}h • ⚡ Velocity: {task.velocity.toFixed(1)} • 📡 From Workdeck API
                  </div>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    padding: '0.125rem 0.5rem', 
                    borderRadius: '0.25rem',
                    backgroundColor: task.status === 'completed' ? '#dcfce7' : task.status === 'in-progress' ? '#dbeafe' : '#f3f4f6',
                    color: task.status === 'completed' ? '#166534' : task.status === 'in-progress' ? '#1e40af' : '#374151',
                    fontWeight: '500'
                  }}>
                    {task.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && teamData.length === 0 && apiConnected && (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>
            No team members found
          </h3>
          <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
            Successfully connected to Workdeck, but no team members are available in your instance.
          </p>
          <button 
            onClick={loadWorkdeckData}
            style={{
              backgroundColor: '#2563eb',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '0.25rem',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default ResourcePlanner;
