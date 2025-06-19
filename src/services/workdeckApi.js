// workdeckApi.js - Version with CORS proxy support
class WorkdeckAPI {
  constructor(baseUrl = process.env.REACT_APP_WORKDECK_URL || 'http://localhost:3000') {
    this.originalBaseUrl = baseUrl;
    
    // Use CORS proxy for external domains to bypass CORS restrictions
    if (baseUrl.includes('test.workdeck.com') || baseUrl.includes('workdeck.com')) {
      // Using allorigins.win as a reliable CORS proxy
      this.baseUrl = baseUrl;
      this.corsProxy = true;
      console.log('🔧 Using CORS proxy for Workdeck API access');
    } else {
      this.baseUrl = baseUrl;
      this.corsProxy = false;
    }
    
    this.token = null;
    this.headers = { 'Content-Type': 'application/json' };
  }

  setToken(token) {
    this.token = token;
    this.headers.Authorization = `Bearer ${token}`;
  }

  async request(endpoint, options = {}) {
    let url;
    let config;

    if (this.corsProxy) {
      // Use allorigins.win proxy for CORS bypass
      const targetUrl = `${this.originalBaseUrl}${endpoint}`;
      url = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;
      
      config = {
        ...options,
        headers: {
          ...this.headers,
          ...options.headers
        }
      };
    } else {
      url = `${this.baseUrl}${endpoint}`;
      config = {
        headers: this.headers,
        ...options
      };
    }

    try {
      console.log(`🌐 API Request: ${this.corsProxy ? 'PROXY → ' : ''}${endpoint}`);
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
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
        // Use proxy for login request
        const targetUrl = `${this.originalBaseUrl}/auth/login`;
        url = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;
        
        config = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
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
        console.log('✅ Login successful');
        this.setToken(data.result);
        return data.result;
      } else {
        const errorText = await response.text();
        console.error('❌ Login failed:', response.status, errorText);
        throw new Error(`Login failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  // API endpoints using your Postman collection
  async getUsers() { 
    return this.request('/queries/users'); 
  }
  
  async getUsersSummary() { 
    return this.request('/queries/users-summary'); 
  }
  
  async getUser(userId) { 
    return this.request(`/queries/users/${userId}`); 
  }
  
  async getUserInfo(userId) { 
    return this.request(`/queries/users-summary/${userId}/info`); 
  }
  
  async getProjects() { 
    return this.request('/queries/projects-summary'); 
  }
  
  async getProject(projectId) { 
    return this.request(`/queries/projects/${projectId}`); 
  }
  
  async getCompany() { 
    return this.request('/queries/company'); 
  }
  
  async getOffices() { 
    return this.request('/queries/offices'); 
  }
  
  async getMyEvents(startDate) {
    const params = startDate ? `?start=${startDate}` : '';
    return this.request(`/queries/me/events${params}`);
  }
  
  async getUserEvents(userId, startDate, endDate, timezone = 'Europe/Madrid') {
    const params = new URLSearchParams({ start: startDate, end: endDate, tz: timezone });
    return this.request(`/queries/events/user/${userId}?${params}`);
  }
  
  async getLeaveRequests(startDate, endDate) {
    const params = new URLSearchParams({ start: startDate, end: endDate });
    return this.request(`/queries/leave-requests?${params}`);
  }
  
  async getWhoIsWhere(department = null) {
    const params = department ? `?department=${encodeURIComponent(department)}` : '';
    return this.request(`/queries/who-is-where${params}`);
  }

  // Create/Update operations from your Postman collection
  async createTask(taskData) {
    return this.request('/commands/sync/create-task', {
      method: 'POST',
      body: JSON.stringify(taskData)
    });
  }

  async createProject(projectData) {
    return this.request('/commands/sync/create-project', {
      method: 'POST',
      body: JSON.stringify(projectData)
    });
  }

  async updateUser(userData) {
    return this.request('/commands/sync/update-user', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  // Get connection status
  getConnectionInfo() {
    return {
      baseUrl: this.originalBaseUrl,
      usingProxy: this.corsProxy,
      authenticated: !!this.token
    };
  }
}

export default WorkdeckAPI;
