// Toggle dropdown menus
function toggleMenu() {
  const menu = document.getElementById("menu");
  menu.style.display = menu.style.display === "block" ? "none" : "block";
  
  // Close account menu if open
  document.getElementById("account").style.display = "none";
}

function toggleAccount() {
  const account = document.getElementById("account");
  account.style.display = account.style.display === "block" ? "none" : "block";
  
  // Close main menu if open
  document.getElementById("menu").style.display = "none";
}

// Close dropdowns when clicking elsewhere
document.addEventListener('click', function(event) {
  const menu = document.getElementById('menu');
  const account = document.getElementById('account');
  const menuIcon = document.querySelector('.menu-icon');
  const accountIcon = document.querySelector('.right-account');
  
  if (menu && !menu.contains(event.target) && menuIcon && !menuIcon.contains(event.target)) {
    menu.style.display = 'none';
  }
  
  if (account && !account.contains(event.target) && accountIcon && !accountIcon.contains(event.target)) {
    account.style.display = 'none';
  }
});

// Modal functions
function openModal(id) {
  document.getElementById(id).style.display = "flex";
}

function closeModal(id) {
  document.getElementById(id).style.display = "none";
}

// Page navigation function
function openPage(pageName) {
  // If it's the home page, use index.html or your main file name
  if (pageName === 'ent_main_html.html' || pageName === 'index.html' || pageName === '/') {
    window.location.href = 'ent_main_html.html'; // Replace with your actual home page filename
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
  
  // Also update any other places where user info might be displayed
  const welcomeUsername = document.getElementById('welcomeUsername');
  if (welcomeUsername) welcomeUsername.textContent = username;
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

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
  // Check if user is authenticated
  if (!checkAuthentication()) {
    return;
  }
  
  // Update account information
  updateAccountInfo();
  
  // Add welcome message if element exists
  const welcomeSection = document.querySelector('.welcome-section');
  if (welcomeSection) {
    const username = localStorage.getItem('tallyAssist_username') || 'User';
    const welcomeHeading = welcomeSection.querySelector('h1');
    if (welcomeHeading) {
      welcomeHeading.innerHTML = `Welcome to TallyAssist, <span id="welcomeUsername">${username}</span>!`;
    }
  }
});

// Close modals when clicking outside
document.addEventListener('click', function(event) {
  const modals = document.querySelectorAll('.modal');
  modals.forEach(modal => {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });
});

// Close modals with Escape key
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
      if (modal.style.display === 'flex') {
        modal.style.display = 'none';
      }
    });
  }
});