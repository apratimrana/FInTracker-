// API Configuration
const API_BASE_URL = '/api';

// API Client Class
class APIClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('authToken');
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  // Get authentication headers
  getAuthHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };
    // Flask backend doesn't require auth, but we keep this for compatibility
    return headers;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getAuthHeaders(),
      ...options
    };
    
    // Add body if it's a string (JSON)
    if (options.body && typeof options.body === 'string') {
      config.body = options.body;
    }

    try {
      const response = await fetch(url, config);
      
      // Check if response has content
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error(text || 'Invalid response from server');
        }
      }

      if (!response.ok) {
        throw new Error(data.error || data.message || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      if (error.message) {
        throw error;
      }
      throw new Error('Network error: Could not connect to the server. Please make sure the server is running.');
    }
  }

  // Authentication methods (simplified - no auth in Flask backend)
  async register(userData) {
    // Flask backend doesn't have auth, so we'll just simulate success
    // Store user data in localStorage for persistence
    if (userData.name) localStorage.setItem('userName', userData.name);
    if (userData.email) localStorage.setItem('userEmail', userData.email);
    if (userData.currency) localStorage.setItem('userCurrency', userData.currency);
    
    // Set monthly budget if provided
    if (userData.monthlyBudget && userData.monthlyBudget > 0) {
      try {
        await this.setBudget(userData.monthlyBudget);
      } catch (err) {
        console.error('Failed to set initial budget:', err);
      }
    }
    
    return Promise.resolve({
      token: 'dummy-token',
      user: { 
        name: userData.name || 'User', 
        email: userData.email,
        currency: userData.currency || 'INR'
      }
    });
  }

  async login(credentials) {
    // Flask backend doesn't have auth, so we'll just simulate success
    // Get stored user data if available
    const storedName = localStorage.getItem('userName') || 'User';
    const storedEmail = localStorage.getItem('userEmail') || credentials.email;
    const storedCurrency = localStorage.getItem('userCurrency') || 'INR';
    
    return Promise.resolve({
      token: 'dummy-token',
      user: { 
        name: storedName, 
        email: storedEmail,
        currency: storedCurrency
      }
    });
  }

  async getCurrentUser() {
    // Flask backend doesn't have auth, return dummy user
    // Try to get user name from localStorage if available
    const storedName = localStorage.getItem('userName');
    return Promise.resolve({
      user: { 
        name: storedName || 'User', 
        email: localStorage.getItem('userEmail') || 'user@example.com',
        currency: localStorage.getItem('userCurrency') || 'INR'
      }
    });
  }

  async updateProfile(profileData) {
    return Promise.resolve({ success: true });
  }

  // Transaction methods
  async getTransactions(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/transactions?${queryString}`);
  }

  async createTransaction(transactionData) {
    return this.request('/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData)
    });
  }

  async getTransaction(id) {
    return this.request(`/transactions/${id}`);
  }

  async updateTransaction(id, transactionData) {
    return this.request(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(transactionData)
    });
  }

  async deleteTransaction(id) {
    return this.request(`/transactions/${id}`, {
      method: 'DELETE'
    });
  }

  async getTransactionStats(params = {}) {
    // Use Flask's summary endpoint
    return this.request('/summary');
  }

  // Dashboard methods
  async getDashboardData() {
    // Use Flask's summary endpoint which returns dashboard data
    const summary = await this.request('/summary');
    // Get monthly comparison data for trends
    let monthlyTrend = [];
    let categoryBreakdown = [];
    try {
      monthlyTrend = await this.request('/charts/monthly_comparison');
      categoryBreakdown = await this.request('/charts/expense_breakdown');
    } catch (error) {
      console.error('Error loading chart data:', error);
    }
    
    // Transform Flask response to match expected format
    return {
      user: { name: 'User', currency: summary.currency || 'INR' },
      currentMonth: {
        totalIncome: summary.monthlyIncome || summary.totalIncome || 0,
        totalExpenses: summary.monthlyExpense || summary.totalExpense || 0,
        netAmount: (summary.monthlyIncome || 0) - (summary.monthlyExpense || 0),
        budgetUsedPercentage: summary.budgetUsedPercentage || 0,
        budgetRemaining: summary.budgetRemaining || 0,
        monthlyBudget: summary.monthlyBudget || 0
      },
      recentTransactions: summary.recentTransactions || [],
      categoryBreakdown: categoryBreakdown || [],
      monthlyTrend: monthlyTrend || [],
      categoryBudgets: summary.categoryBudgets || {},
      categorySpending: summary.categorySpending || {}
    };
  }

  async getCategories() {
    // Get expense breakdown which has categories
    return this.request('/charts/expense_breakdown');
  }

  // Budget methods
  async getBudget() {
    return this.request('/budget');
  }

  async setBudget(monthlyBudget) {
    return this.request('/budget', {
      method: 'POST',
      body: JSON.stringify({ monthlyBudget })
    });
  }

  async setCategoryBudget(category, budget) {
    return this.request('/budget/category', {
      method: 'POST',
      body: JSON.stringify({ category, budget })
    });
  }

  async deleteCategoryBudget(category) {
    return this.request(`/budget/category/${encodeURIComponent(category)}`, {
      method: 'DELETE'
    });
  }
}

// Create global API client instance
const apiClient = new APIClient();

// Authentication state management
class AuthManager {
  constructor() {
    this.isAuthenticated = false;
    this.user = null;
    this.init();
  }

  init() {
    // Flask backend doesn't have auth, so we'll always be "authenticated"
    this.setToken('dummy-token');
    this.setUser({ name: 'User', email: 'user@example.com' });
  }

  setToken(token) {
    apiClient.setToken(token);
    this.isAuthenticated = !!token;
  }

  setUser(user) {
    this.user = user;
    this.isAuthenticated = true;
  }

  logout() {
    this.user = null;
    this.isAuthenticated = false;
    apiClient.setToken(null);
    this.redirectToLogin();
  }

  async getCurrentUser() {
    try {
      const response = await apiClient.getCurrentUser();
      this.setUser(response.user);
      return response.user;
    } catch (error) {
      console.error('Failed to get current user:', error);
      this.logout();
      throw error;
    }
  }

  redirectToLogin() {
    // Flask backend doesn't have auth, so we'll always show dashboard
    this.redirectToDashboard();
  }

  redirectToDashboard() {
    // Show authenticated content and hide login form
    const authContent = document.querySelectorAll('.auth-required');
    const loginContent = document.querySelectorAll('.login-required');
    
    authContent.forEach(el => el.style.display = 'block');
    loginContent.forEach(el => el.style.display = 'none');
  }
}

// Create global auth manager instance
const authManager = new AuthManager();

// Utility functions
function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
  notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
  notification.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  
  document.body.appendChild(notification);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 5000);
}

function showLoading(element) {
  const originalContent = element.innerHTML;
  element.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Loading...';
  element.disabled = true;
  
  return function hideLoading() {
    element.innerHTML = originalContent;
    element.disabled = false;
  };
}

// Export for use in other scripts
window.apiClient = apiClient;
window.authManager = authManager;
window.showNotification = showNotification;
window.showLoading = showLoading;
