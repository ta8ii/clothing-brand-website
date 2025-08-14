// Basic nav toggle
const toggle = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");
if (toggle && navLinks) toggle.addEventListener("click", () => navLinks.classList.toggle("show"));

// Nav search dropdown with suggestions
const searchToggle = document.getElementById('search-toggle');
const navSearch = document.getElementById('nav-search');
const navSearchInput = document.getElementById('nav-search-input');
const navSearchClose = document.getElementById('nav-search-close');
const navSuggestions = document.getElementById('nav-suggestions');

if (searchToggle && navSearch) {
  searchToggle.addEventListener('click', () => {
    navSearch.classList.toggle('active');
    if (navSearch.classList.contains('active')) setTimeout(() => navSearchInput?.focus(), 50);
  });
}
if (navSearchClose && navSearch) navSearchClose.addEventListener('click', () => navSearch.classList.remove('active'));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') navSearch?.classList.remove('active'); });
document.addEventListener('click', (e) => {
  if (!navSearch?.classList.contains('active')) return;
  const inner = e.target.closest('.nav-search-inner');
  const isToggle = e.target.closest('#search-toggle');
  if (!inner && !isToggle) navSearch.classList.remove('active');
});

if (navSearchInput) {
  navSearchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const q = navSearchInput.value.trim();
      if (q) window.location.href = `clothes.html?search=${encodeURIComponent(q)}`;
    }
  });
  navSearchInput.addEventListener('input', () => renderNavSuggestions(navSearchInput.value));
}

function renderNavSuggestions(query) {
  if (!navSuggestions) return;
  const q = (query || '').trim().toLowerCase();
  if (!q) { navSuggestions.classList.remove('show'); navSuggestions.innerHTML=''; return; }
  const sample = ['T-Shirt', 'Jeans', 'Hoodie', 'Sneakers', 'Dress', 'Shirt', 'Footwear', 'Clothing'];
  const matches = sample.filter(t => t.toLowerCase().includes(q)).slice(0,6);
  if (matches.length === 0) { navSuggestions.classList.remove('show'); navSuggestions.innerHTML=''; return; }
  navSuggestions.innerHTML = matches.map(m => `<div class="suggestion-item" data-suggest="${m}">${m}</div>`).join('');
  navSuggestions.classList.add('show');
}

document.addEventListener('click', (e) => {
  const item = e.target.closest('.suggestion-item');
  if (!item || !navSuggestions?.contains(item)) return;
  const value = item.getAttribute('data-suggest') || '';
  if (navSearchInput) navSearchInput.value = value;
  window.location.href = `clothes.html?search=${encodeURIComponent(value)}`;
});

// Demo auth using localStorage
const LS_KEY = 'toro_user';
const authViews = document.getElementById('auth-views');
const accountViews = document.getElementById('account-views');
const accName = document.getElementById('acc-name');
const accEmail = document.getElementById('acc-email');

const signinForm = document.getElementById('panel-signin');
const signupForm = document.getElementById('panel-signup');
const tabs = document.querySelectorAll('.auth-tab');

tabs.forEach(tab => tab.addEventListener('click', () => {
  tabs.forEach(t => t.classList.remove('active'));
  tab.classList.add('active');
  const view = tab.getAttribute('data-tab');
  document.querySelectorAll('.auth-panel').forEach(p => p.classList.add('hidden'));
  document.querySelector(`#panel-${view}`)?.classList.remove('hidden');
}));

function setUser(user) {
  if (user) localStorage.setItem(LS_KEY, JSON.stringify(user));
  else localStorage.removeItem(LS_KEY);
}
function getUser() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || 'null'); } catch { return null; }
}
function renderState() {
  const user = getUser();
  if (user) {
    authViews?.classList.add('hidden');
    accountViews?.classList.remove('hidden');
    accName.textContent = user.name || 'Customer';
    accEmail.textContent = user.email || '';
    document.getElementById('profile-name').value = user.name || '';
    document.getElementById('profile-email').value = user.email || '';
  } else {
    authViews?.classList.remove('hidden');
    accountViews?.classList.add('hidden');
  }
}

if (signinForm) signinForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('signin-email').value.trim();
  const pass = document.getElementById('signin-password').value;
  if (!email || !pass) return;
  const existing = getUser();
  if (existing && existing.email === email) {
    renderState();
  } else {
    // Demo: create a temp session if not existing
    setUser({ name: email.split('@')[0], email });
    renderState();
  }
});

if (signupForm) signupForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const phone = document.getElementById('signup-phone').value.trim();
  const pass = document.getElementById('signup-password').value;
  const pass2 = document.getElementById('signup-password2').value;
  if (!name || !email || !pass) return;
  if (pass !== pass2) {
    alert('Passwords do not match.');
    return;
  }
  setUser({ name, email, phone });
  renderState();
});

const profileForm = document.getElementById('profile-form');
if (profileForm) profileForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const user = getUser() || {};
  user.name = document.getElementById('profile-name').value.trim();
  user.email = document.getElementById('profile-email').value.trim();
  // Optionally persist phone if you add it to profile form later
  setUser(user);
  renderState();
  alert('Profile updated');
});

const passwordForm = document.getElementById('password-form');
if (passwordForm) passwordForm.addEventListener('submit', (e) => {
  e.preventDefault();
  alert('Password updated');
});

const signoutBtn = document.getElementById('signout-btn');
if (signoutBtn) signoutBtn.addEventListener('click', () => { setUser(null); renderState(); });

document.addEventListener('DOMContentLoaded', renderState);


