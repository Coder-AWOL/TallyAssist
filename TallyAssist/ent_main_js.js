// Toggle dropdown menus
function toggleMenu() {
  const menu = document.getElementById("menu");
  const account = document.getElementById("account");
  
  menu.style.display = menu.style.display === "block" ? "none" : "block";
  
  // Close account menu if open
  if (account) {
    account.style.display = "none";
  }
}

function toggleAccount() {
  const account = document.getElementById("account");
  const menu = document.getElementById("menu");
  
  account.style.display = account.style.display === "block" ? "none" : "block";
  
  // Close main menu if open
  if (menu) {
    menu.style.display = "none";
  }
}

// Modal functions
function openModal(id) {
  // Close any other open modals first
  closeAllModals();
  
  const modal = document.getElementById(id);
  if (modal) {
    modal.style.display = "flex";
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.style.display = "none";
    
    // Restore body scroll
    document.body.style.overflow = 'auto';
  }
}

function closeAllModals() {
  const modals = document.querySelectorAll('.modal');
  modals.forEach(modal => {
    modal.style.display = 'none';
  });
  document.body.style.overflow = 'auto';
}

// Page navigation function
function openPage(pageName) {
  if (pageName === 'ent_main_html.html' || pageName === 'index.html' || pageName === '/') {
    window.location.href = 'ent_main_html.html';
  } else {
    window.location.href = pageName;
  }
}

// Update account info when page loads
function updateAccountInfo() {
  const username = localStorage.getItem('tallyAssist_username') || 'User';
  const email = localStorage.getItem('tallyAssist_email') || 'user@example.com';
  const plan = localStorage.getItem('tallyAssist_plan') || 'Premium Plan';
  
  // Update account info in dropdown
  const accountUsername = document.getElementById('accountUsername');
  const accountEmail = document.getElementById('accountEmail');
  const accountPlan = document.getElementById('accountPlan');
  
  if (accountUsername) accountUsername.textContent = username;
  if (accountEmail) accountEmail.textContent = email;
  if (accountPlan) accountPlan.textContent = plan;
}

// Enhanced logout function
function logout() {
  if (confirm('Are you sure you want to logout?')) {
    // Clear user data from localStorage
    localStorage.removeItem('tallyAssist_username');
    localStorage.removeItem('tallyAssist_email');
    localStorage.removeItem('tallyAssist_plan');
    
    // Clear current user session from auth service if available
    if (typeof authService !== 'undefined' && authService.clearCurrentUser) {
      authService.clearCurrentUser();
    } else {
      // Fallback: clear from localStorage directly
      localStorage.removeItem('current_user');
    }
    
    // Redirect to login page
    window.location.href = 'ent_html.html';
  }
}

// Check authentication on page load
function checkAuthentication() {
  const username = localStorage.getItem('tallyAssist_username');
  const email = localStorage.getItem('tallyAssist_email');
  
  // If no user data found, redirect to login page
  if (!username || !email) {
    window.location.href = 'ent_html.html';
    return false;
  }
  
  return true;
}

// Theme functionality
function initializeTheme() {
  const darkThemeToggle = document.getElementById('darkThemeToggle');
  const isDarkTheme = localStorage.getItem('darkTheme') === 'true';
  
  // Set initial state
  if (darkThemeToggle) {
    darkThemeToggle.checked = isDarkTheme;
    setTheme(isDarkTheme);
  }
  
  // Add event listener for theme toggle
  if (darkThemeToggle) {
    darkThemeToggle.addEventListener('change', function() {
      setTheme(this.checked);
    });
  }
}

function setTheme(isDark) {
  if (isDark) {
    document.body.classList.add('dark-theme');
    localStorage.setItem('darkTheme', 'true');
  } else {
    document.body.classList.remove('dark-theme');
    localStorage.setItem('darkTheme', 'false');
  }
  
  // Update charts if they exist (for dashboard)
  updateChartsForTheme(isDark);
}

function updateChartsForTheme(isDark) {
  // This function would be extended in dashboard.js to update chart colors
  if (typeof window.updateChartThemes === 'function') {
    window.updateChartThemes(isDark);
  }
}

// Enhanced Event Delegation for all click events
document.addEventListener('click', function(event) {
  const target = event.target;
  
  // Handle menu toggle
  if (target.closest('.menu-icon')) {
    toggleMenu();
    event.stopPropagation();
    return;
  }
  
  // Handle account toggle
  if (target.closest('.account-icon')) {
    toggleAccount();
    event.stopPropagation();
    return;
  }
  
  // Handle modal opens from nav links
  if (target.closest('.nav-link')) {
    const navLink = target.closest('.nav-link');
    const modalId = navLink.getAttribute('data-modal');
    if (modalId) {
      openModal(modalId);
      event.stopPropagation();
    }
    return;
  }
  
  // Handle page navigation from menu
  if (target.closest('#menu a')) {
    const menuItem = target.closest('#menu a');
    const page = menuItem.getAttribute('data-page');
    if (page) {
      openPage(page);
    }
    return;
  }
  
  // Handle page navigation from feature cards
  if (target.closest('.feature-card')) {
    const card = target.closest('.feature-card');
    const page = card.getAttribute('data-page');
    if (page) {
      openPage(page);
    }
    return;
  }
  
  // Handle page navigation from bottom bar
  if (target.closest('.bottom-icon')) {
    const icon = target.closest('.bottom-icon');
    const page = icon.getAttribute('data-page');
    if (page) {
      openPage(page);
    }
    return;
  }
  
  // Handle logo click (go to home)
  if (target.closest('.logo-title')) {
    openPage('ent_main_html.html');
    return;
  }
  
  // Handle modal closes - FIXED: Check if click is directly on close button or its children
  if (target.closest('.close-modal')) {
    const closeBtn = target.closest('.close-modal');
    const modalId = closeBtn.getAttribute('data-modal');
    if (modalId) {
      closeModal(modalId);
      event.stopPropagation();
    }
    return;
  }
  
  // Handle logout button
  if (target.closest('.logout-btn')) {
    logout();
    return;
  }
  
  // Close modals when clicking directly on modal background
  if (target.classList.contains('modal')) {
    closeModal(target.id);
    return;
  }
  
  // Close dropdowns when clicking outside
  const menu = document.getElementById('menu');
  const account = document.getElementById('account');
  
  if (menu && menu.style.display === 'block') {
    if (!target.closest('#menu') && !target.closest('.menu-icon')) {
      menu.style.display = 'none';
    }
  }
  
  if (account && account.style.display === 'block') {
    if (!target.closest('#account') && !target.closest('.account-icon')) {
      account.style.display = 'none';
    }
  }
});

// Close modals with Escape key
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    closeAllModals();
  }
});

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
  // Check if user is authenticated
  if (!checkAuthentication()) {
    return;
  }
  
  // Update account information
  updateAccountInfo();
  
  // Initialize theme
  initializeTheme();
  
  // Add welcome message if element exists
  const welcomeSection = document.querySelector('.welcome-section');
  if (welcomeSection) {
    const username = localStorage.getItem('tallyAssist_username') || 'User';
    const welcomeHeading = welcomeSection.querySelector('h1');
    if (welcomeHeading) {
      welcomeHeading.innerHTML = `Welcome to TallyAssist, <span style="color: #0b3d91;">${username}</span>!`;
    }
  }
  
  // Initialize all dropdowns as closed
  const menu = document.getElementById('menu');
  const account = document.getElementById('account');
  if (menu) menu.style.display = 'none';
  if (account) account.style.display = 'none';
  
  // Manually set up close buttons for modals that might not be in the DOM initially
  setupModalCloseButtons();
});

// Additional function to ensure close buttons work
function setupModalCloseButtons() {
  // This function can be called to manually set up close buttons
  // for modals that are loaded dynamically or have complex structures
  document.querySelectorAll('.close-modal').forEach(button => {
    button.addEventListener('click', function(e) {
      e.stopPropagation();
      const modalId = this.getAttribute('data-modal');
      if (modalId) {
        closeModal(modalId);
      }
    });
  });
}