class AuthService {
  constructor() {
    this.users = JSON.parse(localStorage.getItem('tallyassist_users')) || [];
    this.resetTokens = JSON.parse(localStorage.getItem('reset_tokens')) || {};
    this.currentUser = JSON.parse(localStorage.getItem('current_user')) || null;
  }

  saveUsers() {
    localStorage.setItem('tallyassist_users', JSON.stringify(this.users));
  }

  saveResetTokens() {
    localStorage.setItem('reset_tokens', JSON.stringify(this.resetTokens));
  }

  saveCurrentUser(user) {
    this.currentUser = user;
    localStorage.setItem('current_user', JSON.stringify(user));
  }

  clearCurrentUser() {
    this.currentUser = null;
    localStorage.removeItem('current_user');
  }

  registerUser(username, password, email) {

    if (this.users.find(user => user.username === username)) {
      return { success: false, message: 'Username already exists' };
    }

    if (this.users.find(user => user.email === email)) {
      return { success: false, message: 'Email already registered' };
    }

    const user = {
      id: Date.now().toString(),
      username,
      password: btoa(password), 
      email,
      createdAt: new Date().toISOString(),
      plan: 'Premium Plan' 
    };

    this.users.push(user);
    this.saveUsers();
    
    this.saveCurrentUser({ id: user.id, username: user.username, email: user.email, plan: user.plan });
    
    return { success: true, message: 'User registered successfully', user: user };
  }

  loginUser(identifier, password) {
    const user = this.users.find(u => u.username === identifier || u.email === identifier);
    if (!user) {
      return { success: false, message: 'Invalid username/email or password' };
    }

    if (user.password !== btoa(password)) {
      return { success: false, message: 'Invalid username/email or password' };
    }

    const userInfo = { 
      id: user.id, 
      username: user.username, 
      email: user.email,
      plan: user.plan 
    };
    
    this.saveCurrentUser(userInfo);
    return { success: true, message: 'Login successful!', user: userInfo };
  }

  getCurrentUser() {
    return this.currentUser;
  }

  getUserByEmail(email) {
    return this.users.find(user => user.email === email);
  }

  generateResetToken(email) {
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    this.resetTokens[token] = {
      email,
      expires: Date.now() + 3600000 
    };
    this.saveResetTokens();
    return token;
  }

  validateResetToken(token) {
    const tokenData = this.resetTokens[token];
    if (!tokenData || tokenData.expires < Date.now()) {
      return null;
    }
    return tokenData.email;
  }

  resetPassword(token, newPassword) {
    const email = this.validateResetToken(token);
    if (!email) {
      return { success: false, message: 'Invalid or expired reset token' };
    }

    const user = this.getUserByEmail(email);
    if (user) {
      user.password = btoa(newPassword);
      this.saveUsers();
      delete this.resetTokens[token];
      this.saveResetTokens();
      return { success: true, message: 'Password reset successfully' };
    }

    return { success: false, message: 'User not found' };
  }
}

const authService = new AuthService();

const loginPage = document.getElementById('loginPage');
const signupPage = document.getElementById('signupPage');
const forgotPasswordPage = document.getElementById('forgotPasswordPage');

const passwordRules = {
  length: { regex: /.{8,}/, element: document.getElementById('ruleLength') },
  uppercase: { regex: /[A-Z]/, element: document.getElementById('ruleUppercase') },
  lowercase: { regex: /[a-z]/, element: document.getElementById('ruleLowercase') },
  number: { regex: /[0-9]/, element: document.getElementById('ruleNumber') },
  special: { regex: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, element: document.getElementById('ruleSpecial') }
};

function generateCaptcha() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let captcha = '';
  for (let i = 0; i < 6; i++) {
    captcha += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return captcha;
}

let loginCaptcha = generateCaptcha();
let signupCaptcha = generateCaptcha();

document.getElementById('loginCaptchaText').textContent = loginCaptcha;
document.getElementById('signupCaptchaText').textContent = signupCaptcha;

function setupPasswordToggle(passwordId, buttonId) {
  const passwordInput = document.getElementById(passwordId);
  const showButton = document.getElementById(buttonId);
  
  showButton.addEventListener('click', () => {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    showButton.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
  });
}

setupPasswordToggle('loginPassword', 'showLoginPassword');
setupPasswordToggle('signupPassword', 'showSignupPassword');
setupPasswordToggle('confirmPassword', 'showConfirmPassword');

document.getElementById('signupPassword').addEventListener('input', function(e) {
  const password = e.target.value;
  
  Object.entries(passwordRules).forEach(([rule, data]) => {
    if (data.regex.test(password)) {
      data.element.classList.add('valid');
      data.element.querySelector('i').className = 'fas fa-check';
    } else {
      data.element.classList.remove('valid');
      data.element.querySelector('i').className = 'fas fa-times';
    }
  });
  
  validatePasswordMatch();
});

document.getElementById('confirmPassword').addEventListener('input', validatePasswordMatch);

function validatePasswordMatch() {
  const password = document.getElementById('signupPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const errorElement = document.getElementById('passwordMatchError');
  
  if (confirmPassword && password !== confirmPassword) {
    errorElement.textContent = 'Passwords do not match';
  } else {
    errorElement.textContent = '';
  }
}

function isPasswordValid(password) {
  return Object.values(passwordRules).every(rule => rule.regex.test(password));
}

document.getElementById('showSignup').addEventListener('click', (e) => {
  e.preventDefault();
  loginPage.classList.add('hidden');
  signupPage.classList.remove('hidden');
  signupCaptcha = generateCaptcha();
  document.getElementById('signupCaptchaText').textContent = signupCaptcha;
});

document.getElementById('showLogin').addEventListener('click', (e) => {
  e.preventDefault();
  signupPage.classList.add('hidden');
  loginPage.classList.remove('hidden');
  loginCaptcha = generateCaptcha();
  document.getElementById('loginCaptchaText').textContent = loginCaptcha;
});

document.getElementById('forgotPassword').addEventListener('click', (e) => {
  e.preventDefault();
  loginPage.classList.add('hidden');
  forgotPasswordPage.classList.remove('hidden');
});

document.getElementById('backToLogin').addEventListener('click', (e) => {
  e.preventDefault();
  forgotPasswordPage.classList.add('hidden');
  loginPage.classList.remove('hidden');
});

document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const identifier = document.getElementById('loginEmail').value; // Can be email or username
  const password = document.getElementById('loginPassword').value;
  const captcha = document.getElementById('loginCaptcha').value;
  
  if (captcha !== loginCaptcha) {
    alert('Invalid captcha. Please try again.');
    loginCaptcha = generateCaptcha();
    document.getElementById('loginCaptchaText').textContent = loginCaptcha;
    document.getElementById('loginCaptcha').value = '';
    return;
  }
  
  const result = authService.loginUser(identifier, password);
  
  if (result.success) {
    alert('Login successful!');
    
    localStorage.setItem('tallyAssist_username', result.user.username);
    localStorage.setItem('tallyAssist_email', result.user.email);
    localStorage.setItem('tallyAssist_plan', result.user.plan);
    
    window.location.href = 'ent_main_html.html';
  } else {
    alert(result.message);
    loginCaptcha = generateCaptcha();
    document.getElementById('loginCaptchaText').textContent = loginCaptcha;
    document.getElementById('loginCaptcha').value = '';
  }
});

document.getElementById('signupForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const username = document.getElementById('signupUsername').value;
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const captcha = document.getElementById('signupCaptcha').value;
  
  if (!isPasswordValid(password)) {
    alert('Please ensure your password meets all requirements.');
    return;
  }
  
  if (password !== confirmPassword) {
    alert('Passwords do not match.');
    return;
  }
  
  if (captcha !== signupCaptcha) {
    alert('Invalid captcha. Please try again.');
    signupCaptcha = generateCaptcha();
    document.getElementById('signupCaptchaText').textContent = signupCaptcha;
    document.getElementById('signupCaptcha').value = '';
    return;
  }
  
  const result = authService.registerUser(username, password, email);
  
  if (result.success) {
    alert('Registration successful! Welcome to TallyAssist.');
    
    localStorage.setItem('tallyAssist_username', result.user.username);
    localStorage.setItem('tallyAssist_email', result.user.email);
    localStorage.setItem('tallyAssist_plan', result.user.plan);
    
    window.location.href = 'ent_main_html.html';
  } else {
    alert(result.message);
  }
  
  signupCaptcha = generateCaptcha();
  document.getElementById('signupCaptchaText').textContent = signupCaptcha;
  document.getElementById('signupCaptcha').value = '';
});

document.getElementById('forgotPasswordForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const email = document.getElementById('resetEmail').value;
  const user = authService.getUserByEmail(email);
  
  if (user) {
    const token = authService.generateResetToken(email);
    alert(`Password reset link has been sent to ${email}. For demo purposes, your reset token is: ${token}`);
    
    setTimeout(() => {
      alert('In a real application, the user would be redirected to a password reset page with the token.');
    }, 1000);
  } else {
    alert('No account found with that email address.');
  }
  
  document.getElementById('forgotPasswordForm').reset();
});

document.addEventListener('DOMContentLoaded', function() {
  const currentUser = authService.getCurrentUser();
  if (currentUser && window.location.pathname.includes('ent_html.html')) {
    localStorage.setItem('tallyAssist_username', currentUser.username);
    localStorage.setItem('tallyAssist_email', currentUser.email);
    localStorage.setItem('tallyAssist_plan', currentUser.plan);
    window.location.href = 'ent_main_html.html';
  }
});

function initializeTheme() {
  const darkThemeToggle = document.getElementById('darkThemeToggle');
  const isDarkTheme = localStorage.getItem('darkTheme') === 'true';
  
  if (darkThemeToggle) {
    darkThemeToggle.checked = isDarkTheme;
    setTheme(isDarkTheme);
  }
  
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
  
  updateChartsForTheme(isDark);
}

function updateChartsForTheme(isDark) {
  if (typeof window.updateChartThemes === 'function') {
    window.updateChartThemes(isDark);
  }
}

document.addEventListener('DOMContentLoaded', function() {
  if (!checkAuthentication()) {
    return;
  }
  
  updateAccountInfo();
  
  initializeTheme();
  
  const welcomeSection = document.querySelector('.welcome-section');
  if (welcomeSection) {
    const username = localStorage.getItem('tallyAssist_username') || 'User';
    const welcomeHeading = welcomeSection.querySelector('h1');
    if (welcomeHeading) {
      welcomeHeading.innerHTML = `Welcome to TallyAssist, <span style="color: #0b3d91;">${username}</span>!`;
    }
  }
  
  const menu = document.getElementById('menu');
  const account = document.getElementById('account');
  if (menu) menu.style.display = 'none';
  if (account) account.style.display = 'none';
});