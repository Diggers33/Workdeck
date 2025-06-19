// workdeckApi.js
class WorkdeckAPI {
  constructor(baseUrl = process.env.REACT_APP_WORKDECK_URL || 'http://localhost:3000') {
    this.baseUrl = baseUrl;
    this.token = null;
    this.headers = { 'Content-Type': 'application/json' };
  }

  setToken(token) {
    this.token = token;
    this.headers.Authorization = `Bearer ${token}`;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = { headers: this.headers, ...options };

    try {
      const response = await fetch(url, config);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Workdeck API request failed:', error);
      throw error;
    }
  }

  // Authentication
  async login(email, password) {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mail: email, password })
    });
    
    if (response.ok) {
      const data = await response.json();
      this.setToken(data.result);
      return data.result;
    }
    throw new Error('Login failed');
  }

  // API methods using your Postman endpoints
  async getUsers() { return this.request('/queries/users'); }
  async getUsersSummary() { return this.request('/queries/users-summary'); }
  async getProjects() { return this.request('/queries/projects-summary'); }
  async getCompany() { return this.request('/queries/company'); }
  async getMyEvents(startDate) {
    const params = startDate ? `?start=${startDate}` : '';
    return this.request(`/queries/me/events${params}`);
  }
}

export default WorkdeckAPI;
