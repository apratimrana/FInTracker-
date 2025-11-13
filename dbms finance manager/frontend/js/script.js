// FinTrack JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add scroll effect to navbar
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Animate elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.feature-card, .step-card, .dashboard-preview').forEach(el => {
        observer.observe(el);
    });
});

// Authentication and Transaction Management Functions

// Show authentication modal
function showAuthModal() {
    const authModalEl = document.getElementById('authModal');
    if (!authModalEl) {
        // If auth modal doesn't exist, just show dashboard
        if (typeof showDashboard === 'function') {
            showDashboard();
        }
        return;
    }
    
    const authModal = new bootstrap.Modal(authModalEl);
    authModal.show();
    showLoginForm();
}

// Show login form
function showLoginForm() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const authModalTitle = document.getElementById('authModalTitle');
    const showRegister = document.getElementById('showRegister');
    const showLogin = document.getElementById('showLogin');
    const loginToggleText = document.getElementById('loginToggleText');
    const registerToggleText = document.getElementById('registerToggleText');
    
    if (loginForm) loginForm.style.display = 'block';
    if (registerForm) registerForm.style.display = 'none';
    if (authModalTitle) authModalTitle.textContent = 'Sign In to FinTrack';
    if (loginToggleText) loginToggleText.style.display = 'block';
    if (registerToggleText) registerToggleText.style.display = 'none';
}

// Show register form
function showRegisterForm() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const authModalTitle = document.getElementById('authModalTitle');
    const showRegister = document.getElementById('showRegister');
    const showLogin = document.getElementById('showLogin');
    const loginToggleText = document.getElementById('loginToggleText');
    const registerToggleText = document.getElementById('registerToggleText');
    
    if (loginForm) loginForm.style.display = 'none';
    if (registerForm) registerForm.style.display = 'block';
    if (authModalTitle) authModalTitle.textContent = 'Create Your FinTrack Account';
    if (loginToggleText) loginToggleText.style.display = 'none';
    if (registerToggleText) registerToggleText.style.display = 'block';
}

// Show dashboard modal
function showDashboard() {
    const dashboardModalEl = document.getElementById('dashboardModal');
    if (!dashboardModalEl) {
        console.error('Dashboard modal not found');
        return;
    }
    
    const dashboardModal = new bootstrap.Modal(dashboardModalEl);
    dashboardModal.show();
    loadDashboard();
}

// Show transaction modal (for add or edit)
let editingTransactionId = null;

function showTransactionModal(transactionId = null) {
    editingTransactionId = transactionId;
    const transactionModal = new bootstrap.Modal(document.getElementById('transactionModal'));
    const modalTitle = document.getElementById('transactionModalTitle');
    const form = document.getElementById('transactionForm');
    const submitBtn = form.querySelector('button[type="submit"]');
    
    if (transactionId) {
        // Edit mode
        modalTitle.textContent = 'Edit Transaction';
        submitBtn.textContent = 'Update Transaction';
        loadTransactionForEdit(transactionId);
    } else {
        // Add mode
        modalTitle.textContent = 'Add Transaction';
        submitBtn.textContent = 'Add Transaction';
        form.reset();
        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('transactionDate').value = today;
    }
    
    transactionModal.show();
}

// Load transaction data for editing
async function loadTransactionForEdit(transactionId) {
    try {
        if (typeof apiClient === 'undefined' || typeof apiClient.getTransaction !== 'function') {
            throw new Error('API client not available');
        }
        
        const transaction = await apiClient.getTransaction(transactionId);
        
        const typeInput = document.getElementById('transactionType');
        const amountInput = document.getElementById('transactionAmount');
        const descriptionInput = document.getElementById('transactionDescription');
        const categoryInput = document.getElementById('transactionCategory');
        const dateInput = document.getElementById('transactionDate');
        const paymentMethodInput = document.getElementById('transactionPaymentMethod');
        const notesInput = document.getElementById('transactionNotes');
        
        if (typeInput) typeInput.value = transaction.type || 'Expense';
        if (amountInput) amountInput.value = transaction.amount || 0;
        if (descriptionInput) descriptionInput.value = transaction.description || '';
        if (categoryInput) categoryInput.value = transaction.category || '';
        if (dateInput) dateInput.value = transaction.date || new Date().toISOString().split('T')[0];
        if (paymentMethodInput) paymentMethodInput.value = transaction.payment_method || 'cash';
        if (notesInput) notesInput.value = transaction.notes || '';
    } catch (error) {
        console.error('Error loading transaction:', error);
        showNotification('Failed to load transaction for editing. Please try again.', 'danger');
    }
}

// Logout function
function logout() {
    // Clear user data from localStorage
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userCurrency');
    localStorage.removeItem('authToken');
    
    if (typeof authManager !== 'undefined') {
    authManager.logout();
    }
    
    // Hide dashboard and show login
    const authContent = document.querySelectorAll('.auth-required');
    const loginContent = document.querySelectorAll('.login-required');
    
    authContent.forEach(el => el.style.display = 'none');
    loginContent.forEach(el => el.style.display = 'block');
    
    // Close any open modals
    const openModals = document.querySelectorAll('.modal.show');
    openModals.forEach(modal => {
        const bsModal = bootstrap.Modal.getInstance(modal);
        if (bsModal) bsModal.hide();
    });
    
    showNotification('You have been logged out successfully', 'info');
}

// Function to scroll to signup section (legacy support)
// Since we don't have authentication, this directly shows the dashboard
function scrollToSignup(event) {
    if (event) {
        event.preventDefault();
    }
    
    // Always show dashboard since we don't have authentication
    const currentPath = window.location.pathname;
    const isIndexPage = currentPath.includes('index.html') || currentPath === '/' || currentPath.endsWith('/') || currentPath.includes('/index') || !currentPath.includes('.html');
    
    if (isIndexPage) {
        // On index page, show dashboard directly
        if (typeof showDashboard === 'function') {
            showDashboard();
        } else {
            // Fallback: redirect to dashboard functionality
            console.log('Dashboard function not available');
        }
    } else {
        // On other pages, redirect to index and show dashboard
        sessionStorage.setItem('showDashboard', 'true');
        window.location.href = 'index.html';
    }
}

// Form validation and submission
function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return false;

    const inputs = form.querySelectorAll('input[required], textarea[required]');
    let isValid = true;

    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.classList.add('is-invalid');
            isValid = false;
        } else {
            input.classList.remove('is-invalid');
        }
    });

    // Email validation
    const emailInputs = form.querySelectorAll('input[type="email"]');
    emailInputs.forEach(input => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (input.value && !emailRegex.test(input.value)) {
            input.classList.add('is-invalid');
            isValid = false;
        }
    });

    return isValid;
}

// Handle contact form submission
function handleContactForm(event) {
    event.preventDefault();
    
    if (validateForm('contactForm')) {
        const submitBtn = event.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Sending...';
        submitBtn.disabled = true;
        
        // Simulate form submission (in a real app, this would send to backend)
        setTimeout(() => {
            showNotification('Thank you for your message! We\'ll get back to you soon.', 'success');
            event.target.reset();
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }, 1500);
    } else {
        showNotification('Please fill in all required fields correctly.', 'danger');
    }
}

// Mock data for demo charts
const mockChartData = {
    expenses: {
        labels: ['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills'],
        data: [450, 200, 150, 300, 400]
    },
    monthly: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        income: [2500, 2600, 2400, 2800, 2700, 2900],
        expenses: [1800, 1900, 1700, 2100, 2000, 2200]
    }
};

// Initialize demo charts (if Chart.js is loaded)
function initDemoCharts() {
    if (typeof Chart === 'undefined') return;

    // Expense breakdown chart
    const expenseCtx = document.getElementById('expenseChart');
    if (expenseCtx) {
        new Chart(expenseCtx, {
            type: 'doughnut',
            data: {
                labels: mockChartData.expenses.labels,
                datasets: [{
                    data: mockChartData.expenses.data,
                    backgroundColor: [
                        '#28a745',
                        '#20c997',
                        '#17a2b8',
                        '#6f42c1',
                        '#fd7e14'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    // Monthly trend chart
    const monthlyCtx = document.getElementById('monthlyChart');
    if (monthlyCtx) {
        new Chart(monthlyCtx, {
            type: 'line',
            data: {
                labels: mockChartData.monthly.labels,
                datasets: [{
                    label: 'Income',
                    data: mockChartData.monthly.income,
                    borderColor: '#28a745',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    tension: 0.4
                }, {
                    label: 'Expenses',
                    data: mockChartData.monthly.expenses,
                    borderColor: '#dc3545',
                    backgroundColor: 'rgba(220, 53, 69, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

// Initialize charts when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Load Chart.js dynamically if needed
    if (document.getElementById('expenseChart') || document.getElementById('monthlyChart')) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.onload = initDemoCharts;
        document.head.appendChild(script);
    }
});

// Add loading states to buttons
function addLoadingState(button) {
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Loading...';
    button.disabled = true;
    
    return function removeLoadingState() {
        button.innerHTML = originalText;
        button.disabled = false;
    };
}

// Utility function for smooth animations
function animateValue(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        element.textContent = value;
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Animate counters on scroll
function animateCounters() {
    const counters = document.querySelectorAll('.counter');
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        animateValue(counter, 0, target, 2000);
    });
}

// Initialize counter animation when counters come into view
const counterObserver = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounters();
            counterObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

document.addEventListener('DOMContentLoaded', function() {
    const counterSection = document.querySelector('.counters-section');
    if (counterSection) {
        counterObserver.observe(counterSection);
    }

    // Initialize authentication and transaction handlers (only if elements exist)
    if (document.getElementById('loginForm')) {
    initializeAuthHandlers();
    }
    if (document.getElementById('transactionForm')) {
    initializeTransactionHandlers();
    }
    checkAuthStatus();
    
    // Check if we should show dashboard after redirect
    if (sessionStorage.getItem('showDashboard') === 'true') {
        sessionStorage.removeItem('showDashboard');
        setTimeout(() => {
            if (typeof showDashboard === 'function') {
                showDashboard();
            }
        }, 500);
    }
    
    // Initialize contact form if it exists
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }
});

// Initialize authentication event handlers
function initializeAuthHandlers() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const showRegister = document.getElementById('showRegister');
    const showLogin = document.getElementById('showLogin');
    
    // Login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        await handleLogin();
    });
    }

    // Register form submission
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        await handleRegister();
    });
    }

    // Form switching
    if (showRegister) {
        showRegister.addEventListener('click', function(e) {
        e.preventDefault();
        showRegisterForm();
    });
    }

    if (showLogin) {
        showLogin.addEventListener('click', function(e) {
        e.preventDefault();
        showLoginForm();
    });
    }
}

// Initialize transaction event handlers
function initializeTransactionHandlers() {
    const transactionForm = document.getElementById('transactionForm');
    if (transactionForm) {
        transactionForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        await handleTransactionSubmit();
    });
    }
}

// Handle user login
async function handleLogin() {
    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');
    const loginForm = document.getElementById('loginForm');
    
    if (!emailInput || !passwordInput || !loginForm) {
        showNotification('Login form not found.', 'danger');
        return;
    }
    
    const email = emailInput.value;
    const password = passwordInput.value;
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    
    const hideLoading = showLoading(submitBtn);
    
    try {
        const response = await apiClient.login({ email, password });
        
        if (typeof authManager !== 'undefined') {
        authManager.setToken(response.token);
        authManager.setUser(response.user);
        authManager.redirectToDashboard();
        }
        
        // Update UI
        const userNameEl = document.getElementById('userName');
        if (userNameEl) {
            userNameEl.textContent = response.user.name;
        }
        
        // Close modal
        const authModalEl = document.getElementById('authModal');
        if (authModalEl) {
            const authModal = bootstrap.Modal.getInstance(authModalEl);
            if (authModal) {
        authModal.hide();
            }
        }
        
        // Show dashboard after login
        if (typeof showDashboard === 'function') {
            setTimeout(() => showDashboard(), 300);
        }
        
        showNotification('Welcome back! You have been logged in successfully.', 'success');
        
    } catch (error) {
        showNotification(error.message || 'Login failed. Please try again.', 'danger');
    } finally {
        hideLoading();
    }
}

// Handle user registration
async function handleRegister() {
    const nameInput = document.getElementById('registerName');
    const emailInput = document.getElementById('registerEmail');
    const passwordInput = document.getElementById('registerPassword');
    const budgetInput = document.getElementById('registerBudget');
    const currencyInput = document.getElementById('registerCurrency');
    const registerForm = document.getElementById('registerForm');
    
    if (!nameInput || !emailInput || !passwordInput || !registerForm) {
        showNotification('Registration form not found.', 'danger');
        return;
    }
    
    const name = nameInput.value;
    const email = emailInput.value;
    const password = passwordInput.value;
    const monthlyBudget = parseFloat(budgetInput ? budgetInput.value : 0) || 0;
    const currency = currencyInput ? currencyInput.value : 'INR';
    const submitBtn = registerForm.querySelector('button[type="submit"]');
    
    const hideLoading = showLoading(submitBtn);
    
    try {
        const response = await apiClient.register({
            name,
            email,
            password,
            monthlyBudget,
            currency
        });
        
        // Set monthly budget if provided
        if (monthlyBudget > 0 && typeof apiClient !== 'undefined' && typeof apiClient.setBudget === 'function') {
            try {
                await apiClient.setBudget(monthlyBudget);
            } catch (err) {
                console.error('Failed to set budget:', err);
            }
        }
        
        // Set currency if provided
        if (currency && typeof apiClient !== 'undefined') {
            // Currency setting would go here if we had an endpoint
        }
        
        if (typeof authManager !== 'undefined') {
        authManager.setToken(response.token);
        authManager.setUser(response.user);
        authManager.redirectToDashboard();
        }
        
        // Update UI
        const userNameEl = document.getElementById('userName');
        if (userNameEl) {
            userNameEl.textContent = response.user.name;
        }
        
        // Close modal
        const authModalEl = document.getElementById('authModal');
        if (authModalEl) {
            const authModal = bootstrap.Modal.getInstance(authModalEl);
            if (authModal) {
        authModal.hide();
            }
        }
        
        // Show dashboard after registration
        if (typeof showDashboard === 'function') {
            setTimeout(() => showDashboard(), 300);
        }
        
        showNotification('Account created successfully! Welcome to FinTrack!', 'success');
        
    } catch (error) {
        showNotification(error.message || 'Registration failed. Please try again.', 'danger');
    } finally {
        hideLoading();
    }
}

// Handle transaction submission (add or update)
async function handleTransactionSubmit() {
    const transactionForm = document.getElementById('transactionForm');
    if (!transactionForm) {
        showNotification('Transaction form not found.', 'danger');
        return;
    }
    
    const typeInput = document.getElementById('transactionType');
    const amountInput = document.getElementById('transactionAmount');
    const descriptionInput = document.getElementById('transactionDescription');
    const categoryInput = document.getElementById('transactionCategory');
    const dateInput = document.getElementById('transactionDate');
    const paymentMethodInput = document.getElementById('transactionPaymentMethod');
    const notesInput = document.getElementById('transactionNotes');
    
    if (!typeInput || !amountInput || !descriptionInput || !categoryInput || !dateInput) {
        showNotification('Please fill in all required fields.', 'danger');
        return;
    }
    
    const type = typeInput.value;
    const amount = parseFloat(amountInput.value);
    const description = descriptionInput.value.trim();
    const category = categoryInput.value.trim();
    const dateInputValue = dateInput.value;
    const paymentMethod = paymentMethodInput ? paymentMethodInput.value : 'cash';
    const notes = notesInput ? notesInput.value.trim() : '';
    
    // Validation
    if (!type || type === '') {
        showNotification('Please select a transaction type.', 'danger');
        return;
    }
    
    if (isNaN(amount) || amount <= 0) {
        showNotification('Please enter a valid amount greater than 0.', 'danger');
        return;
    }
    
    if (!description) {
        showNotification('Please enter a description.', 'danger');
        return;
    }
    
    if (!category) {
        showNotification('Please enter a category.', 'danger');
        return;
    }
    
    // Flask API expects: type, amount, category, description, date (YYYY-MM-DD format)
    const transactionData = {
        type: type, // 'Income' or 'Expense'
        amount: amount,
        category: category,
        description: description,
        date: dateInputValue || new Date().toISOString().split('T')[0], // Format as YYYY-MM-DD
        paymentMethod: paymentMethod,
        notes: notes
    };
    
    const submitBtn = transactionForm.querySelector('button[type="submit"]');
    const hideLoading = showLoading(submitBtn);
    
    try {
        if (typeof apiClient === 'undefined') {
            throw new Error('API client not available');
        }
        
        if (editingTransactionId) {
            // Update existing transaction
            if (typeof apiClient.updateTransaction !== 'function') {
                throw new Error('Update transaction function not available');
            }
            await apiClient.updateTransaction(editingTransactionId, transactionData);
            showNotification('Transaction updated successfully!', 'success');
        } else {
            // Create new transaction
            if (typeof apiClient.createTransaction !== 'function') {
                throw new Error('Create transaction function not available');
            }
        await apiClient.createTransaction(transactionData);
            showNotification('Transaction added successfully!', 'success');
        }
        
        // Reset form and editing state
        transactionForm.reset();
        editingTransactionId = null;
        
        // Set default date
        const today = new Date().toISOString().split('T')[0];
        if (dateInput) {
            dateInput.value = today;
        }
        
        // Close modal
        const transactionModalEl = document.getElementById('transactionModal');
        if (transactionModalEl) {
            const transactionModal = bootstrap.Modal.getInstance(transactionModalEl);
            if (transactionModal) {
        transactionModal.hide();
            }
        }
        
        // Refresh dashboard if it's open
        const dashboardModal = document.getElementById('dashboardModal');
        if (dashboardModal && dashboardModal.classList.contains('show')) {
            if (typeof loadDashboard === 'function') {
                setTimeout(() => loadDashboard(), 500);
            }
        }
        
        // Refresh transactions list if it's open
        const allTransactionsModal = document.getElementById('allTransactionsModal');
        if (allTransactionsModal && allTransactionsModal.classList.contains('show')) {
            if (typeof loadAllTransactions === 'function') {
                setTimeout(() => loadAllTransactions(), 500);
            }
        }
        
    } catch (error) {
        console.error('Error saving transaction:', error);
        showNotification(error.message || 'Failed to save transaction. Please try again.', 'danger');
    } finally {
        hideLoading();
    }
}

// Delete transaction with confirmation
async function deleteTransaction(transactionId) {
    if (!confirm('Are you sure you want to delete this transaction? This action cannot be undone.')) {
        return;
    }
    
    try {
        if (typeof apiClient === 'undefined' || typeof apiClient.deleteTransaction !== 'function') {
            throw new Error('API client not available');
        }
        
        await apiClient.deleteTransaction(transactionId);
        showNotification('Transaction deleted successfully!', 'success');
        
        // Refresh dashboard if it's open
        const dashboardModal = document.getElementById('dashboardModal');
        if (dashboardModal && dashboardModal.classList.contains('show')) {
            if (typeof loadDashboard === 'function') {
                loadDashboard();
            }
        }
        
        // Refresh transactions list if it's open
        const allTransactionsModal = document.getElementById('allTransactionsModal');
        if (allTransactionsModal && allTransactionsModal.classList.contains('show')) {
            if (typeof loadAllTransactions === 'function') {
                loadAllTransactions();
            }
        }
    } catch (error) {
        console.error('Error deleting transaction:', error);
        showNotification(error.message || 'Failed to delete transaction. Please try again.', 'danger');
    }
}

// Load dashboard data
async function loadDashboard() {
    const dashboardContent = document.getElementById('dashboardContent');
    if (!dashboardContent) {
        console.error('Dashboard content element not found');
        return;
    }
    
    // Show loading state
    dashboardContent.innerHTML = `
        <div class="text-center">
            <div class="spinner-border text-success" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">Loading your dashboard...</p>
        </div>
    `;
    
    try {
        if (typeof apiClient === 'undefined') {
            throw new Error('API client not available');
        }
        
        const data = await apiClient.getDashboardData();
        renderDashboard(data);
    } catch (error) {
        console.error('Dashboard load error:', error);
        if (dashboardContent) {
        dashboardContent.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle me-2"></i>
                    Failed to load dashboard data. Please refresh the page and try again.
                    <br><small>Error: ${error.message}</small>
            </div>
        `;
        }
    }
}

// Render dashboard content
function renderDashboard(data) {
    const dashboardContent = document.getElementById('dashboardContent');
    if (!dashboardContent) {
        console.error('Dashboard content element not found');
        return;
    }
    
    const currency = data.user?.currency || 'INR';
    const currencySymbol = getCurrencySymbol(currency);
    const userName = data.user?.name || 'User';
    
    dashboardContent.innerHTML = `
        <div class="row mb-4">
            <div class="col-12">
                <h4>Welcome back, ${userName}!</h4>
                <p class="text-muted">Here's your financial overview for this month</p>
            </div>
        </div>
        
        <div class="row mb-4">
            <div class="col-md-3 mb-3">
                <div class="card bg-success text-white">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div>
                                <h6 class="card-title">Total Income</h6>
                                <h4>${currencySymbol}${data.currentMonth.totalIncome.toFixed(2)}</h4>
                            </div>
                            <div class="align-self-center">
                                <i class="fas fa-arrow-up fa-2x"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3 mb-3">
                <div class="card bg-danger text-white">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div>
                                <h6 class="card-title">Total Expenses</h6>
                                <h4>${currencySymbol}${data.currentMonth.totalExpenses.toFixed(2)}</h4>
                            </div>
                            <div class="align-self-center">
                                <i class="fas fa-arrow-down fa-2x"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3 mb-3">
                <div class="card ${data.currentMonth.netAmount >= 0 ? 'bg-info' : 'bg-warning'} text-white">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div>
                                <h6 class="card-title">Net Amount</h6>
                                <h4>${currencySymbol}${data.currentMonth.netAmount.toFixed(2)}</h4>
                            </div>
                            <div class="align-self-center">
                                <i class="fas fa-balance-scale fa-2x"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3 mb-3">
                <div class="card ${data.currentMonth.budgetUsedPercentage > 100 ? 'bg-danger' : data.currentMonth.budgetUsedPercentage > 80 ? 'bg-warning' : 'bg-primary'} text-white">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div>
                                <h6 class="card-title">Budget Used</h6>
                                <h4>${data.currentMonth.monthlyBudget > 0 ? data.currentMonth.budgetUsedPercentage.toFixed(1) + '%' : 'Not Set'}</h4>
                                <small>${data.currentMonth.monthlyBudget > 0 ? currencySymbol + data.currentMonth.budgetRemaining.toFixed(2) + ' remaining' : 'Set monthly budget'}</small>
                            </div>
                            <div class="align-self-center">
                                <i class="fas fa-chart-pie fa-2x"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="row">
            <div class="col-md-6 mb-4">
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">Recent Transactions</h5>
                        <button class="btn btn-sm btn-success" onclick="showAllTransactions()">
                            <i class="fas fa-list me-1"></i>View All
                        </button>
                    </div>
                    <div class="card-body" style="max-height: 400px; overflow-y: auto;">
                        ${renderRecentTransactions(data.recentTransactions, currencySymbol)}
                    </div>
                </div>
            </div>
            <div class="col-md-6 mb-4">
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">Budget & Spending</h5>
                        <button class="btn btn-sm btn-primary" onclick="showBudgetModal()">
                            <i class="fas fa-cog me-1"></i>Manage Budget
                        </button>
                    </div>
                    <div class="card-body">
                        ${renderBudgetBreakdown(data.categoryBudgets, data.categorySpending, currencySymbol)}
                    </div>
                </div>
            </div>
        </div>
        
        <div class="row">
            <div class="col-12">
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">Monthly Trend</h5>
                        <button class="btn btn-success btn-sm" onclick="showTransactionModal()">
                            <i class="fas fa-plus me-1"></i>Add Transaction
                        </button>
                    </div>
                    <div class="card-body">
                        <canvas id="monthlyTrendChart" height="100"></canvas>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Initialize chart after content is rendered
    setTimeout(() => {
        initMonthlyTrendChart(data.monthlyTrend, currencySymbol);
    }, 100);
}

// Render recent transactions with edit/delete buttons
function renderRecentTransactions(transactions, currencySymbol) {
    if (transactions.length === 0) {
        return '<p class="text-muted text-center">No transactions yet. <a href="#" onclick="showTransactionModal()">Add your first transaction</a></p>';
    }
    
    return transactions.map(transaction => {
        const isIncome = transaction.type === 'Income';
        return `
        <div class="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
            <div class="d-flex align-items-center flex-grow-1">
                <div class="me-3">
                    <i class="fas fa-${isIncome ? 'arrow-up text-success' : 'arrow-down text-danger'}"></i>
                </div>
                <div class="flex-grow-1">
                    <div class="fw-bold">${transaction.description || 'No description'}</div>
                    <small class="text-muted">${transaction.category || 'Uncategorized'}</small>
                    <br><small class="text-muted">${new Date(transaction.date).toLocaleDateString()}</small>
                </div>
            </div>
            <div class="text-end me-3">
                <div class="fw-bold ${isIncome ? 'text-success' : 'text-danger'}">
                    ${isIncome ? '+' : '-'}${currencySymbol}${transaction.amount.toFixed(2)}
                </div>
            </div>
            <div class="d-flex gap-1">
                <button class="btn btn-sm btn-outline-primary" onclick="showTransactionModal(${transaction.id})" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteTransaction(${transaction.id})" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
        </div>
        </div>
    `;
    }).join('');
}

// Render category breakdown
function renderCategoryBreakdown(categories, currencySymbol) {
    if (categories.length === 0) {
        return '<p class="text-muted text-center">No expense data available</p>';
    }
    
    return categories.map(category => `
        <div class="d-flex justify-content-between align-items-center mb-2">
            <span>${category.category || 'Uncategorized'}</span>
            <span class="fw-bold">${currencySymbol}${(category.total || 0).toFixed(2)}</span>
        </div>
    `).join('');
}

// Render budget breakdown with category budgets
function renderBudgetBreakdown(categoryBudgets, categorySpending, currencySymbol) {
    const categories = Object.keys({...categoryBudgets, ...categorySpending});
    
    if (categories.length === 0) {
        return '<p class="text-muted text-center">No budget set. <a href="#" onclick="showBudgetModal()">Set up your budget</a></p>';
    }
    
    return categories.map(category => {
        const budget = categoryBudgets[category] || 0;
        const spent = categorySpending[category] || 0;
        const percentage = budget > 0 ? (spent / budget * 100) : 0;
        const progressColor = percentage > 100 ? 'danger' : percentage > 80 ? 'warning' : 'success';
        
        return `
        <div class="mb-3">
            <div class="d-flex justify-content-between align-items-center mb-1">
                <span class="fw-bold">${category}</span>
                <span class="text-muted">${currencySymbol}${spent.toFixed(2)} / ${currencySymbol}${budget.toFixed(2)}</span>
            </div>
            <div class="progress" style="height: 8px;">
                <div class="progress-bar bg-${progressColor}" style="width: ${Math.min(percentage, 100)}%"></div>
            </div>
            <small class="text-muted">${percentage.toFixed(1)}% used</small>
        </div>
    `;
    }).join('');
}

// Initialize monthly trend chart
function initMonthlyTrendChart(data, currencySymbol) {
    const ctx = document.getElementById('monthlyTrendChart');
    if (!ctx) return;
    
    if (!data || data.length === 0) {
        ctx.parentElement.innerHTML = '<p class="text-muted text-center">No monthly data available yet. Add transactions to see trends.</p>';
        return;
    }
    
    const labels = data.map(item => {
        const [year, month] = item.month.split('-');
        return new Date(year, month - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    });
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Income',
                data: data.map(item => item.income || 0),
                borderColor: '#28a745',
                backgroundColor: 'rgba(40, 167, 69, 0.1)',
                tension: 0.4,
                fill: true
            }, {
                label: 'Expenses',
                data: data.map(item => item.expense || 0),
                borderColor: '#dc3545',
                backgroundColor: 'rgba(220, 53, 69, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return currencySymbol + value.toFixed(0);
                        }
                    }
                }
            }
        }
    });
}

// Get currency symbol
function getCurrencySymbol(currency) {
    const symbols = {
        'INR': '₹',
        'USD': '$',
        'EUR': '€',
        'GBP': '£'
    };
    return symbols[currency] || '₹';
}

// Check authentication status on page load
function checkAuthStatus() {
    // Flask backend doesn't have auth, so we'll always show dashboard
    if (typeof authManager !== 'undefined') {
        authManager.redirectToDashboard();
        if (authManager.user) {
            const userNameEl = document.getElementById('userName');
            if (userNameEl) {
                userNameEl.textContent = authManager.user.name;
            }
        }
    }
}

// Show Privacy Policy modal
function showPrivacyPolicy() {
    const modalHtml = `
        <div class="modal fade" id="privacyModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Privacy Policy</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <h6 class="fw-bold">Last Updated: ${new Date().toLocaleDateString()}</h6>
                        <p class="text-muted">FinTrack is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information.</p>
                        <h6 class="fw-bold mt-4">Information We Collect</h6>
                        <p>We collect information that you provide directly to us, including financial transaction data, budget information, and account preferences.</p>
                        <h6 class="fw-bold mt-4">How We Use Your Information</h6>
                        <p>We use your information to provide and improve our services, process transactions, and send you updates about your financial activity.</p>
                        <h6 class="fw-bold mt-4">Data Security</h6>
                        <p>We implement appropriate security measures to protect your personal information. Your data is stored locally and is not shared with third parties.</p>
                        <h6 class="fw-bold mt-4">Your Rights</h6>
                        <p>You have the right to access, update, or delete your personal information at any time through your account settings.</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const existingModal = document.getElementById('privacyModal');
    if (existingModal) existingModal.remove();
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = new bootstrap.Modal(document.getElementById('privacyModal'));
    modal.show();
}

// Show Terms of Service modal
function showTermsOfService() {
    const modalHtml = `
        <div class="modal fade" id="termsModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Terms of Service</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <h6 class="fw-bold">Last Updated: ${new Date().toLocaleDateString()}</h6>
                        <p class="text-muted">Please read these Terms of Service carefully before using FinTrack.</p>
                        <h6 class="fw-bold mt-4">Acceptance of Terms</h6>
                        <p>By accessing or using FinTrack, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>
                        <h6 class="fw-bold mt-4">Use License</h6>
                        <p>Permission is granted to temporarily use FinTrack for personal, non-commercial use. This is the grant of a license, not a transfer of title.</p>
                        <h6 class="fw-bold mt-4">User Responsibilities</h6>
                        <p>You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account.</p>
                        <h6 class="fw-bold mt-4">Limitation of Liability</h6>
                        <p>FinTrack shall not be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with your use of the service.</p>
                        <h6 class="fw-bold mt-4">Changes to Terms</h6>
                        <p>We reserve the right to modify these terms at any time. Your continued use of the service constitutes acceptance of any changes.</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const existingModal = document.getElementById('termsModal');
    if (existingModal) existingModal.remove();
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = new bootstrap.Modal(document.getElementById('termsModal'));
    modal.show();
}

// Show budget management modal
function showBudgetModal() {
    // Check if modal already exists
    let budgetModalEl = document.getElementById('budgetModal');
    
    if (!budgetModalEl) {
        // Create and show budget modal
        const modalHtml = `
            <div class="modal fade" id="budgetModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Manage Budget</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-4">
                                <label class="form-label fw-bold">Monthly Budget</label>
                                <div class="input-group">
                                    <span class="input-group-text">₹</span>
                                    <input type="number" id="monthlyBudgetInput" class="form-control" placeholder="0.00" min="0" step="0.01">
                                    <button class="btn btn-success" type="button" onclick="if(typeof saveMonthlyBudget === 'function') saveMonthlyBudget();">Save</button>
                                </div>
                                <small class="text-muted">Set your total monthly budget for expenses</small>
                            </div>
                            <hr>
                            <h6 class="fw-bold mb-3">Category Budgets</h6>
                            <div id="categoryBudgetsList">
                                <div class="text-center">
                                    <div class="spinner-border spinner-border-sm text-success" role="status"></div>
                                    <p class="text-muted mt-2">Loading budgets...</p>
                                </div>
                            </div>
                            <button class="btn btn-sm btn-outline-primary mt-2" type="button" onclick="if(typeof addCategoryBudget === 'function') addCategoryBudget();">
                                <i class="fas fa-plus me-1"></i>Add Category Budget
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        budgetModalEl = document.getElementById('budgetModal');
    }
    
    const budgetModal = new bootstrap.Modal(budgetModalEl);
    budgetModal.show();
    
    // Load current budget
    if (typeof loadBudgetData === 'function') {
        loadBudgetData();
    }
}

// Load budget data
async function loadBudgetData() {
    const monthlyBudgetInput = document.getElementById('monthlyBudgetInput');
    const categoryBudgetsList = document.getElementById('categoryBudgetsList');
    
    if (!monthlyBudgetInput || !categoryBudgetsList) {
        console.error('Budget modal elements not found');
        return;
    }
    
    try {
        if (typeof apiClient === 'undefined' || typeof apiClient.getBudget !== 'function') {
            throw new Error('API client not available');
        }
        
        const budgetData = await apiClient.getBudget();
        monthlyBudgetInput.value = budgetData.monthlyBudget || 0;
        await renderCategoryBudgetsList(budgetData.categoryBudgets || []);
    } catch (error) {
        console.error('Error loading budget:', error);
        if (categoryBudgetsList) {
            categoryBudgetsList.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Failed to load budget data. Please try again.
                </div>
            `;
        }
        showNotification('Failed to load budget data.', 'danger');
    }
}

// Render category budgets list
async function renderCategoryBudgetsList(categoryBudgets) {
    const listContainer = document.getElementById('categoryBudgetsList');
    if (!listContainer) {
        console.error('Category budgets list container not found');
        return;
    }
    
    if (!categoryBudgets || categoryBudgets.length === 0) {
        listContainer.innerHTML = '<p class="text-muted text-center py-3">No category budgets set. Click "Add Category Budget" to create one.</p>';
        return;
    }
    
    // Get currency symbol
    let currencySymbol = '₹'; // Default
    try {
        if (typeof apiClient !== 'undefined' && typeof apiClient.getTransactionStats === 'function') {
            const summary = await apiClient.getTransactionStats();
            currencySymbol = getCurrencySymbol(summary.currency || 'INR');
        }
    } catch (error) {
        console.error('Error getting currency:', error);
        // Use default currency symbol
    }
    
    // Escape category names for safe HTML
    const escapeHtml = (text) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    };
    
    listContainer.innerHTML = categoryBudgets.map(budget => {
        const category = escapeHtml(budget.category || 'Uncategorized');
        const budgetAmount = (budget.monthly_budget || 0).toFixed(2);
        return `
            <div class="d-flex justify-content-between align-items-center mb-2 p-3 bg-light rounded border">
                <div class="flex-grow-1">
                    <strong>${category}</strong>
                    <br><small class="text-muted">Monthly Budget: ${currencySymbol}${budgetAmount}</small>
                </div>
                <button class="btn btn-sm btn-outline-danger" type="button" onclick="if(typeof deleteCategoryBudget === 'function') deleteCategoryBudget('${category.replace(/'/g, "\\'")}')" title="Delete Budget">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    }).join('');
}

// Save monthly budget
async function saveMonthlyBudget() {
    const monthlyBudgetInput = document.getElementById('monthlyBudgetInput');
    if (!monthlyBudgetInput) {
        showNotification('Budget input not found.', 'danger');
        return;
    }
    
    const monthlyBudget = parseFloat(monthlyBudgetInput.value) || 0;
    
    if (monthlyBudget < 0) {
        showNotification('Budget cannot be negative.', 'danger');
        return;
    }
    
    try {
        if (typeof apiClient === 'undefined' || typeof apiClient.setBudget !== 'function') {
            throw new Error('API client not available');
        }
        
        await apiClient.setBudget(monthlyBudget);
        showNotification('Monthly budget updated successfully!', 'success');
        
        // Refresh dashboard if it's open
        const dashboardModal = document.getElementById('dashboardModal');
        if (dashboardModal && dashboardModal.classList.contains('show')) {
            if (typeof loadDashboard === 'function') {
                loadDashboard();
            }
        }
    } catch (error) {
        console.error('Error saving budget:', error);
        showNotification('Failed to save monthly budget. Please try again.', 'danger');
    }
}

// Add category budget
function addCategoryBudget() {
    const category = prompt('Enter category name:');
    if (!category || !category.trim()) {
        return;
    }
    
    const budgetInput = prompt(`Enter monthly budget for ${category}:`);
    if (!budgetInput) {
        return;
    }
    
    const budget = parseFloat(budgetInput);
    if (isNaN(budget) || budget <= 0) {
        showNotification('Invalid budget amount. Please enter a positive number.', 'danger');
        return;
    }
    
    saveCategoryBudget(category.trim(), budget);
}

// Save category budget
async function saveCategoryBudget(category, budget) {
    try {
        if (typeof apiClient === 'undefined' || typeof apiClient.setCategoryBudget !== 'function') {
            throw new Error('API client not available');
        }
        
        await apiClient.setCategoryBudget(category, budget);
        showNotification(`Budget for ${category} saved successfully!`, 'success');
        
        // Refresh budget list
        if (typeof loadBudgetData === 'function') {
            loadBudgetData();
        }
        
        // Refresh dashboard if it's open
        const dashboardModal = document.getElementById('dashboardModal');
        if (dashboardModal && dashboardModal.classList.contains('show')) {
            if (typeof loadDashboard === 'function') {
                loadDashboard();
            }
        }
    } catch (error) {
        console.error('Error saving category budget:', error);
        showNotification('Failed to save category budget. Please try again.', 'danger');
    }
}

// Delete category budget
async function deleteCategoryBudget(category) {
    if (!confirm(`Delete budget for ${category}?`)) {
        return;
    }
    
    try {
        if (typeof apiClient === 'undefined' || typeof apiClient.deleteCategoryBudget !== 'function') {
            throw new Error('API client not available');
        }
        
        await apiClient.deleteCategoryBudget(category);
        showNotification(`Budget for ${category} deleted.`, 'success');
        
        // Refresh budget list
        if (typeof loadBudgetData === 'function') {
            loadBudgetData();
        }
        
        // Refresh dashboard if it's open
        const dashboardModal = document.getElementById('dashboardModal');
        if (dashboardModal && dashboardModal.classList.contains('show')) {
            if (typeof loadDashboard === 'function') {
                loadDashboard();
            }
        }
    } catch (error) {
        console.error('Error deleting category budget:', error);
        showNotification('Failed to delete category budget. Please try again.', 'danger');
    }
}

// Show all transactions
function showAllTransactions() {
    // Check if modal already exists
    let transactionsModalEl = document.getElementById('allTransactionsModal');
    
    if (!transactionsModalEl) {
        // Create and show transactions modal
        const modalHtml = `
            <div class="modal fade" id="allTransactionsModal" tabindex="-1">
                <div class="modal-dialog modal-xl">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">All Transactions</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body" style="max-height: 70vh; overflow-y: auto;">
                            <div id="allTransactionsContent">
                                <div class="text-center">
                                    <div class="spinner-border text-success" role="status"></div>
                                    <p class="mt-2">Loading transactions...</p>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-success" onclick="if(typeof showTransactionModal === 'function') { bootstrap.Modal.getInstance(document.getElementById('allTransactionsModal')).hide(); setTimeout(() => showTransactionModal(), 300); }">
                                <i class="fas fa-plus me-1"></i>Add Transaction
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        transactionsModalEl = document.getElementById('allTransactionsModal');
    }
    
    const transactionsModal = new bootstrap.Modal(transactionsModalEl);
    transactionsModal.show();
    
    // Load all transactions
    if (typeof loadAllTransactions === 'function') {
        loadAllTransactions();
    }
}

// Load all transactions
async function loadAllTransactions() {
    const content = document.getElementById('allTransactionsContent');
    if (!content) {
        console.error('Transactions content element not found');
        return;
    }
    
    // Show loading state
    content.innerHTML = `
        <div class="text-center">
            <div class="spinner-border text-success" role="status"></div>
            <p class="mt-2">Loading transactions...</p>
        </div>
    `;
    
    try {
        if (typeof apiClient === 'undefined' || typeof apiClient.getTransactions !== 'function') {
            throw new Error('API client not available');
        }
        
        const transactions = await apiClient.getTransactions();
        const summary = await apiClient.getTransactionStats().catch(() => ({}));
        const currencySymbol = getCurrencySymbol(summary.currency || 'INR');
        
        if (!transactions || transactions.length === 0) {
            content.innerHTML = `
                <div class="text-center py-5">
                    <i class="fas fa-receipt fa-3x text-muted mb-3"></i>
                    <p class="text-muted">No transactions yet.</p>
                    <button class="btn btn-success btn-sm" onclick="if(typeof showTransactionModal === 'function') { bootstrap.Modal.getInstance(document.getElementById('allTransactionsModal')).hide(); setTimeout(() => showTransactionModal(), 300); }">
                        <i class="fas fa-plus me-1"></i>Add Your First Transaction
                    </button>
                </div>
            `;
            return;
        }
        
        // Group transactions by date
        const grouped = transactions.reduce((acc, transaction) => {
            const date = new Date(transaction.date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            if (!acc[date]) acc[date] = [];
            acc[date].push(transaction);
            return acc;
        }, {});
        
        // Sort dates (most recent first)
        const sortedDates = Object.keys(grouped).sort((a, b) => {
            return new Date(b) - new Date(a);
        });
        
        content.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="mb-0">Total: ${transactions.length} transaction${transactions.length !== 1 ? 's' : ''}</h6>
                <button class="btn btn-success btn-sm" onclick="if(typeof showTransactionModal === 'function') { bootstrap.Modal.getInstance(document.getElementById('allTransactionsModal')).hide(); setTimeout(() => showTransactionModal(), 300); }">
                    <i class="fas fa-plus me-1"></i>Add Transaction
                </button>
            </div>
            ${sortedDates.map(date => `
            <div class="mb-4">
                <h6 class="fw-bold text-muted mb-2 border-bottom pb-1">${date}</h6>
                ${grouped[date].map(transaction => {
                    const isIncome = transaction.type === 'Income';
                    return `
                    <div class="d-flex justify-content-between align-items-center mb-2 p-3 bg-light rounded border">
                        <div class="d-flex align-items-center flex-grow-1">
                            <div class="me-3">
                                <div class="rounded-circle bg-${isIncome ? 'success' : 'danger'} text-white d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
                                    <i class="fas fa-${isIncome ? 'arrow-up' : 'arrow-down'}"></i>
                                </div>
                            </div>
                            <div class="flex-grow-1">
                                <div class="fw-bold">${(transaction.description || 'No description').substring(0, 50)}${transaction.description && transaction.description.length > 50 ? '...' : ''}</div>
                                <small class="text-muted">
                                    <i class="fas fa-tag me-1"></i>${transaction.category || 'Uncategorized'}
                                    ${transaction.payment_method ? ` • <i class="fas fa-credit-card me-1"></i>${transaction.payment_method}` : ''}
                                </small>
                            </div>
                        </div>
                        <div class="text-end me-3">
                            <div class="fw-bold ${isIncome ? 'text-success' : 'text-danger'} fs-5">
                                ${isIncome ? '+' : '-'}${currencySymbol}${transaction.amount.toFixed(2)}
                            </div>
                            <small class="text-muted">${new Date(transaction.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</small>
                        </div>
                        <div class="d-flex gap-1">
                            <button class="btn btn-sm btn-outline-primary" onclick="if(typeof showTransactionModal === 'function') { const modal = bootstrap.Modal.getInstance(document.getElementById('allTransactionsModal')); if(modal) modal.hide(); setTimeout(() => showTransactionModal(${transaction.id}), 300); }" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="if(typeof deleteTransaction === 'function') deleteTransaction(${transaction.id})" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `;
                }).join('')}
            </div>
        `).join('')}`;
    } catch (error) {
        console.error('Error loading transactions:', error);
        content.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle me-2"></i>
                Failed to load transactions. Please refresh the page and try again.
                <br><small>Error: ${error.message}</small>
            </div>
        `;
    }
}
