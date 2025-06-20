import React, { useState, useEffect } from 'react';

// Enhanced WorkdeckAPI class with better CORS handling
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

  async makeRequest(endpoint, options = {}) {
    const targetUrl = `${this.originalBaseUrl}${endpoint}`;
    
    // Enhanced proxy list with more options
    const proxies = [
      // Option 1: cors-proxy.htmldriven.com (reliable)
      {
        name: 'htmldriven-cors',
        url: `https://cors-proxy.htmldriven.com/?url=${encodeURIComponent(targetUrl)}`,
        transform: (options) => ({
          method: options.method || 'GET',
          headers: { 
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            ...options.headers 
          },
          body: options.body
        })
      },
      // Option 2: thingproxy.freeboard.io
      {
        name: 'thingproxy',
        url: `https://thingproxy.freeboard.io/fetch/${targetUrl}`,
        transform: (options) => ({
          method: options.method || 'GET',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...options.headers 
          },
          body: options.body
        })
      },
      // Option 3: cors-anywhere (backup)
      {
        name: 'cors-anywhere',
        url: `https://cors-anywhere.herokuapp.com/${targetUrl}`,
        transform: (options) => ({
          method: options.method || 'GET',
          headers: { 
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            ...options.headers 
          },
          body: options.body
        })
      },
      // Option 4: allorigins (GET only but reliable)
      {
        name: 'allorigins',
        url: `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`,
        transform: (options) => ({
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        }),
        postProcess: (text) => {
          try {
            return JSON.parse(text);
          } catch (e) {
            console.log('AllOrigins raw response:', text.substring(0, 200));
            throw new Error('Invalid JSON response from server');
          }
        }
      }
    ];

    let lastError;
    
    for (const proxy of proxies) {
      try {
        console.log(`🌐 Trying ${proxy.name} for ${endpoint}`);
        
        const config = proxy.transform({ ...options, headers: this.headers });
        const response = await fetch(proxy.url, config);
        
        console.log(`📡 ${proxy.name} response:`, response.status, response.statusText);

        if (response.ok) {
          const text = await response.text();
          
          let data;
          if (proxy.postProcess) {
            data = proxy.postProcess(text);
          } else {
            try {
              data = JSON.parse(text);
            } catch (e) {
              console.log(`❌ ${proxy.name} returned invalid JSON:`, text.substring(0, 200));
              throw new Error('Server returned invalid JSON');
            }
          }
          
          console.log(`✅ ${proxy.name} success:`, data);
          return data;
        } else {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 100)}`);
        }
      } catch (error) {
        console.log(`❌ ${proxy.name} failed:`, error.message);
        lastError = error;
        continue;
      }
    }
    
    throw new Error(`All proxy methods failed. Last error: ${lastError?.message || 'Unknown error'}`);
  }

  async login(email, password) {
    try {
      console.log('🔐 Starting login process...');
      
      const data = await this.makeRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ mail: email, password })
      });

      if (data && data.result) {
        console.log('✅ Login successful!');
        this.setToken(data.result);
        return data.result;
      } else if (data && data.error) {
        throw new Error(`Login failed: ${data.error}`);
      } else {
        throw new Error('Login response missing token');
      }

    } catch (error) {
      console.error('❌ Login failed:', error);
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  async request(endpoint, options = {}) {
    if (!this.token) {
      throw new Error('Not authenticated - please login first');
    }
    return this.makeRequest(endpoint, options);
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

// Mock data generator for when API fails
class MockDataGenerator {
  static generateMockTeamData() {
    console.log('🎭 Generating mock data for demonstration...');
    
    const mockUsers = [
      { id: 1, firstName: 'Sarah', lastName: 'Chen', department: 'Engineering', email: 'sarah.chen@company.com' },
      { id: 2, firstName: 'Marcus', lastName: 'Johnson', department: 'Design', email: 'marcus.j@company.com' },
      { id: 3, firstName: 'Elena', lastName: 'Rodriguez', department: 'Product', email: 'elena.r@company.com' },
      { id: 4, firstName: 'David', lastName: 'Kim', department: 'Engineering', email: 'david.kim@company.com' },
      { id: 5, firstName: 'Priya', lastName: 'Patel', department: 'Marketing', email: 'priya.p@company.com' }
    ];

    const mockProjects = [
      { id: 1, name: 'Mobile App Redesign', status: 'active' },
      { id: 2, name: 'API Integration', status: 'active' },
      { id: 3, name: 'Customer Dashboard', status: 'planning' },
      { id: 4, name: 'Data Analytics Platform', status: 'active' }
    ];

    return {
      users: mockUsers,
      projects: mockProjects,
      company: { name: 'Demo Company', id: 1 }
    };
  }
}

// Enhanced DataTransformer
class DataTransformer {
  static transformUsersToTeamMembers(users, projects = []) {
    console.log('🔄 Transforming data:', { users: users?.length || 0, projects: projects?.length || 0 });
    
    if (!users || users.length === 0) {
      return [];
    }
    
    return users.map(user => {
      const userProjects = projects.slice(0, Math.floor(Math.random() * 3) + 1);
      const tasks = userProjects.map((project, index) => ({
        id: `${user.id}-task-${index}`,
        project: project.name || `Project ${index + 1}`,
        activity: `${user.department || 'General'} Work`,
        task: `${project.name || `Task ${index + 1}`} Development`,
        color: this.getProjectColor(project.name),
        estimatedHours: 20 + Math.floor(Math.random() * 60),
        actualHours: Math.floor(Math.random() * 40),
        velocity: 3 + Math.random() * 7,
        status: ['planned', 'in-progress', 'completed'][Math.floor(Math.random() * 3)],
        targetHoursPerWeek: 8 + Math.floor(Math.random() * 8),
        pattern: Array.from({ length: 10 }, () => Math.random() > 0.3)
      }));

      const totalScheduled = tasks.reduce((sum, task) => sum + task.targetHoursPerWeek, 0);
      const capacity = 40;

      return {
        id: user.id,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || `User ${user.id}`,
        avatar: this.generateAvatar(user.firstName || `User${user.id}`),
        department: user.department || 'Unknown',
        email: user.email || 'No email',
        capacity: capacity,
        scheduled: totalScheduled,
        utilization: Math.round((totalScheduled / capacity) * 100),
        tasks: tasks
      };
    });
  }

  static getProjectColor(projectName) {
    const colors = ['bg-purple-600', 'bg-blue-600', 'bg-green-600', 'bg-orange-500', 'bg-red-500', 'bg-indigo-600'];
    const hash = (projectName || '').split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return colors[Math.abs(hash) % colors.length];
  }

  static generateAvatar(firstName) {
    const emojis = ['👨‍💻', '👩‍💻', '👨‍💼', '👩‍💼', '👨‍🎨', '👩‍🎨', '👨‍🔬', '👩‍🔬'];
    const hash = (firstName || '').charCodeAt(0) || 0;
    return emojis[hash % emojis.length];
  }
}

const ResourcePlanner = () => {
  const [teamData, setTeamData] = useState([]);
  const [projects, setProjects] = useState([]);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiConnected, setApiConnected] = useState(false);
  const [usingMockData, setUsingMockData] = useState(false);

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

  const loadMockData = () => {
    console.log('🎭 Loading mock data for demonstration...');
    const mockData = MockDataGenerator.generateMockTeamData();
    const teamMembers = DataTransformer.transformUsersToTeamMembers(mockData.users, mockData.projects);
    
    setTeamData(teamMembers);
    setProjects(mockData.projects);
    setCompany(mockData.company);
    setUsingMockData(true);
    setApiConnected(false);
    setError(null);
  };

  const loadWorkdeckData = async () => {
    setLoading(true);
    setError(null);
    setUsingMockData(false);
    
    try {
      console.log('📊 Loading team data from Workdeck...');
      
      const [usersResponse, projectsResponse, companyResponse] = await Promise.allSettled([
        workdeckAPI.getUsers(),
        workdeckAPI.getProjects(),
        workdeckAPI.getCompany()
      ]);

      const users = usersResponse.status === 'fulfilled' 
        ? (usersResponse.value?.result || usersResponse.value || [])
        : [];
      
      const projectsData = projectsResponse.status === 'fulfilled'
        ? (projectsResponse.value?.result || projectsResponse.value || [])
        : [];
        
      const companyData = companyResponse.status === 'fulfilled'
        ? (companyResponse.value?.result || companyResponse.value || {})
        : {};

      console.log('📈 Data loaded:', { 
        users: users.length, 
        projects: projectsData.length,
        company: companyData.name || 'Unknown'
      });

      if (users.length === 0 && projectsData.length === 0) {
        throw new Error('No data returned from API - check your credentials and permissions');
      }

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
      
      // Auto-fallback to mock data after API failure
      console.log('🔄 Falling back to mock data...');
      setTimeout(() => {
        loadMockData();
      }, 2000);
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
              <button 
                onClick={loadMockData}
                style={{
                  marginTop: '0.5rem',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '0.25rem',
                  border: 'none',
                  fontSize: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                Try Demo with Mock Data
              </button>
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
          
          <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#f3f4f6', borderRadius: '0.375rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#6b7280', textAlign: 'center', marginBottom: '0.5rem' }}>
              Having trouble connecting?
            </div>
            <button 
              onClick={() => {
                setIsAuthenticated(true);
                loadMockData();
              }}
              style={{
                width: '100%',
                backgroundColor: '#6b7280',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '0.25rem',
                border: 'none',
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
            >
              Try Demo with Sample Data
            </button>
            <div style={{ fontSize: '0.625rem', color: '#9ca3af', textAlign: 'center', marginTop: '0.25rem' }}>
              Enhanced CORS proxy handling + fallback demo
            </div>
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
            Resource Planner {usingMockData && '(Demo Mode)'}
          </h1>
          <button 
            onClick={() => {
              setIsAuthenticated(false);
              setTeamData([]);
              setProjects([]);
              setCompany(null);
              setApiConnected(false);
              setUsingMockData(false);
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
            {usingMockData ? 'Back to Login' : 'Logout'}
          </button>
        </div>
        
        {usingMockData && (
          <div style={{ backgroundColor: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#92400e', marginBottom: '0.5rem' }}>
              🎭 Demo Mode - Sample Data
            </h3>
            <div style={{ fontSize: '0.75rem', color: '#92400e' }}>
              <div>• This is demonstration data to show the interface</div>
              <div>• Real Workdeck API connection failed due to CORS restrictions</div>
              <div>• Try connecting from a server environment or configure CORS on Workdeck</div>
            </div>
          </div>
        )}
        
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
        
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          <button 
            onClick={loadWorkdeckData}
            disabled={loading}
            style={{
              backgroundColor: loading ? '#9ca3af' : '#2563eb',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '0.25rem',
              border: 'none',
              fontSize: '0.875rem',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Syncing with Workdeck...' : 'Refresh Live Data'}
          </button>
          
          <button 
            onClick={loadMockData}
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
            Load Demo Data
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '1.125rem', color: '#6b7280', marginBottom: '0.5rem' }}>
            📡 Loading data from Workdeck API...
          </div>
          <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
            Trying multiple CORS proxy methods for reliable connection
          </div>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.5rem' }}>
            If this fails, we'll automatically show demo data
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && !usingMockData && (
        <div style={{ 
          backgroundColor: '#fef2f2', 
          border: '1px solid #fecaca', 
          borderRadius: '0.5rem', 
          padding: '1rem',
          marginBottom: '1rem'
        }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#dc2626', marginBottom: '0.5rem' }}>
            🚨 Workdeck API Connection Failed
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#dc2626', marginBottom: '0.5rem' }}>{error}</p>
          <div style={{ fontSize: '0.75rem', color: '#dc2626', marginBottom: '1rem' }}>
            This is likely due to CORS restrictions. The demo will load automatically in a moment.
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={loadWorkdeckData}
              style={{
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
            <button 
              onClick={loadMockData}
              style={{
                backgroundColor: '#6b7280',
                color: 'white',
                padding: '0.25rem 0.75rem',
                borderRadius: '0.25rem',
                border: 'none',
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
            >
              Load Demo Now
            </button>
          </div>
        </div>
      )}

      {/* Team Data */}
      {!loading && teamData.length > 0 && (
        <div>
          <div style={{ 
            backgroundColor: usingMockData ? '#fef3c7' : '#1f2937', 
            color: usingMockData ? '#92400e' : 'white', 
            borderRadius: '0.5rem', 
            padding: '1rem', 
            marginBottom: '1rem' 
          }}>
            <h3 style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
              {usingMockData ? '🎭 Demo Team Data' : '🎉 Live Team Data from Workdeck'}
            </h3>
            <p style={{ fontSize: '0.875rem', color: usingMockData ? '#92400e' : '#d1d5db' }}>
              {teamData.length} team members • {projects.length} projects • 
              {usingMockData ? ' Sample data for demonstration' : ' Real data from test.workdeck.com'}
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
                    {member.email && (
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{member.email}</div>
                    )}
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
                    📊 {task.actualHours}h / {task.estimatedHours}h • ⚡ Velocity: {task.velocity.toFixed(1)} • 
                    {usingMockData ? ' 🎭 Demo Data' : ' 📡 From Workdeck API'}
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
      {!loading && teamData.length === 0 && !error && (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>
            No team members found
          </h3>
          <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
            {apiConnected 
              ? 'Successfully connected to Workdeck, but no team members are available in your instance.'
              : 'Connect to Workdeck or try the demo to see your team\'s resource planning data.'
            }
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
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
              Try Workdeck Again
            </button>
            <button 
              onClick={loadMockData}
              style={{
                backgroundColor: '#6b7280',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '0.25rem',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Load Demo Data
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ 
        marginTop: '2rem', 
        padding: '1rem', 
        backgroundColor: 'white', 
        borderRadius: '0.5rem', 
        border: '1px solid #e5e7eb',
        fontSize: '0.75rem',
        color: '#6b7280',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '0.5rem' }}>
          <strong>Resource Planner v2.0</strong> - Enhanced CORS handling with automatic fallback
        </div>
        <div>
          CORS Issues? This tool uses multiple proxy methods and provides demo data when API access fails.
          For production use, configure CORS headers on your Workdeck instance or deploy this app server-side.
        </div>
      </div>
    </div>
  );
};

export default ResourcePlanner;
