// workdeckApi.js - API service for Workdeck integration

const WORKDECK_BASE_URL = 'https://test-api.workdeck.com';

class WorkdeckAPI {
  constructor() {
    this.token = null;
    this.baseURL = WORKDECK_BASE_URL;
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
  }

  // Generic API request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.result || data; // Workdeck returns data in 'result' field
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication
  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        mail: email,
        password: password,
      }),
    });
    
    if (response) {
      this.setToken(response);
    }
    
    return response;
  }

  // Get current user info
  async getCurrentUser() {
    return this.request('/queries/me');
  }

  // Get team members (users)
  async getUsers() {
    return this.request('/queries/users');
  }

  // Get projects
  async getProjects() {
    return this.request('/queries/projects-summary');
  }

  // Get tasks for a specific project
  async getProjectTasks(projectId) {
    return this.request(`/queries/projects/${projectId}`);
  }

  // Get user's tasks
  async getUserTasks(userId) {
    // This might need to be implemented based on available endpoints
    // For now, we'll use events as a proxy for tasks
    return this.request(`/queries/me/events`);
  }

  // Get offices (for team structure)
  async getOffices() {
    return this.request('/queries/offices');
  }

  // Get company info
  async getCompany() {
    return this.request('/queries/company');
  }

  // Get events (can be used as tasks/activities)
  async getEvents(startDate = null) {
    const params = startDate ? `?start=${startDate}` : '';
    return this.request(`/queries/me/events${params}`);
  }

  // Create a new task/event
  async createEvent(eventData) {
    return this.request('/commands/sync/create-event', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  // Update an event/task
  async updateEvent(eventData) {
    return this.request('/commands/sync/update-event', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }
}

// Create singleton instance
const workdeckAPI = new WorkdeckAPI();

export default workdeckAPI;
