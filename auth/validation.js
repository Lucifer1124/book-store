
const form = document.getElementById('form');
const firstname_input = document.getElementById('firstname-input');
const email_input = document.getElementById('email-input');
const password_input = document.getElementById('password-input');
const repeat_password_input = document.getElementById('repeat-password-input');
const error_message = document.getElementById('error-message');

form.addEventListener('submit', (e) => {
  e.preventDefault(); 
  let errors = [];
  let isSignup = false;

  if (firstname_input) {
    //if a firstname input then we are in the signup
    isSignup = true;
    errors = getSignupFormErrors(
      firstname_input.value,
      email_input.value,
      password_input.value,
      repeat_password_input.value
    );
  } else {
    //no firstname input then we are in the login
    isSignup = false;
    errors = getLoginFormErrors(email_input.value, password_input.value);
  }

  if (errors.length > 0) {
    // If there are any errors
    error_message.innerText = errors.join(". ");
    return;
  }

  // If no errors, process the form
  if (isSignup) {
    handleSignup(
      firstname_input.value,
      email_input.value,
      password_input.value
    );
  } else {
    handleLogin(
      email_input.value,
      password_input.value
    );
  }
});

function getSignupFormErrors(firstname, email, password, repeatPassword) {
  let errors = [];

  if (firstname === '' || firstname == null) {
    errors.push('Firstname is required');
    firstname_input.parentElement.classList.add('incorrect');
  }
  if (email === '' || email == null) {
    errors.push('Email is required');
    email_input.parentElement.classList.add('incorrect');
  }
  if (password === '' || password == null) {
    errors.push('Password is required');
    password_input.parentElement.classList.add('incorrect');
  }
  if (password.length < 8) {
    errors.push('Password must have at least 8 characters');
    password_input.parentElement.classList.add('incorrect');
  }
  if (password !== repeatPassword) {
    errors.push('Password does not match repeated password');
    password_input.parentElement.classList.add('incorrect');
    repeat_password_input.parentElement.classList.add('incorrect');
  }

  return errors;
}

function getLoginFormErrors(email, password) {
  let errors = [];

  if (email === '' || email == null) {
    errors.push('Email is required');
    email_input.parentElement.classList.add('incorrect');
  }
  if (password === '' || password == null) {
    errors.push('Password is required');
    password_input.parentElement.classList.add('incorrect');
  }

  return errors;
}

function handleSignup(firstname, email, password) {
  // Get existing users from localStorage
  let users = JSON.parse(localStorage.getItem('users')) || [];

  // Check if user already exists
  const existingUser = users.find(user => user.email === email);
  if (existingUser) {
    error_message.innerText = 'User with this email already exists';
    email_input.parentElement.classList.add('incorrect');
    return;
  }

  // Create user object
  const user = {
    id: Date.now(),
    firstname: firstname,
    email: email,
    username: firstname.toLowerCase().replace(/\s+/g, ''),
    password: password, // In real app, you should hash the password
    createdAt: new Date().toISOString()
  };

  // Add to users array
  users.push(user);

  // Save to localStorage
  localStorage.setItem('users', JSON.stringify(users));

  // Set current user (automatically log them in)
  localStorage.setItem('currentUser', JSON.stringify({
    id: user.id,
    firstname: user.firstname,
    email: user.email,
    username: user.username
    // Don't store password in currentUser session
  }));

  // Show success message and redirect
  showMessage('Account created successfully! Redirecting...', 'success');

  setTimeout(() => {
    window.location.href = '../home/home.html';
  }, 1500);
}

function handleLogin(email, password) {
  // Get users from localStorage
  const users = JSON.parse(localStorage.getItem('users')) || [];

  // Find user by email
  const user = users.find(user => user.email === email);

  if (!user) {
    error_message.innerText = 'No account found with this email';
    email_input.parentElement.classList.add('incorrect');
    return;
  }

  // Check password (in real app, compare hashed passwords)
  if (user.password !== password) {
    error_message.innerText = 'Incorrect password';
    password_input.parentElement.classList.add('incorrect');
    return;
  }

  // Login successful - set current user
  localStorage.setItem('currentUser', JSON.stringify({
    id: user.id,
    firstname: user.firstname,
    email: user.email,
    username: user.username
    // Don't store password in currentUser session
  }));

  // Show success message and redirect
  showMessage('Login successful! Redirecting...', 'success');

  setTimeout(() => {
    window.location.href = '../home/home.html';
  }, 1500);
}

function showMessage(message, type) {
  // Create a temporary message element
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${type}`;
  messageDiv.textContent = message;
  messageDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 5px;
    background-color: ${type === 'success' ? '#4CAF50' : '#f44336'};
    color: white;
    z-index: 1000;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  `;

  document.body.appendChild(messageDiv);

  // Remove after 3 seconds
  setTimeout(() => {
    messageDiv.remove();
  }, 3000);
}

// Clear error on input
const allInputs = [firstname_input, email_input, password_input, repeat_password_input].filter(input => input != null);

allInputs.forEach(input => {
  input.addEventListener('input', () => {
    if (input.parentElement.classList.contains('incorrect')) {
      input.parentElement.classList.remove('incorrect');
      error_message.innerText = '';
    }
  });
});

// Check if user is already logged in (redirect to home if they are)
document.addEventListener('DOMContentLoaded', () => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (currentUser) {
    window.location.href = '../home/home.html';
  }
});
const users = JSON.parse(localStorage.getItem('users'));
console.log('Users:', users);
