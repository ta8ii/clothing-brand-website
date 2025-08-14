const toggle = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");

toggle.addEventListener("click", () => {
  navLinks.classList.toggle("show");
});

// Simple nav search that routes to clothes page with query
const searchToggle = document.getElementById('search-toggle');
const navSearch = document.getElementById('nav-search');
const navSearchInput = document.getElementById('nav-search-input');
const navSearchClose = document.getElementById('nav-search-close');
const navSuggestions = document.getElementById('nav-suggestions');

if (searchToggle && navSearch) {
  searchToggle.addEventListener('click', () => {
    navSearch.classList.toggle('active');
    if (navSearch.classList.contains('active')) {
      setTimeout(() => navSearchInput && navSearchInput.focus(), 50);
    }
  });
}
if (navSearchClose && navSearch) {
  navSearchClose.addEventListener('click', () => navSearch.classList.remove('active'));
}
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') navSearch?.classList.remove('active');
});
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
  navSearchInput.addEventListener('input', () => {
    renderNavSuggestions(navSearchInput.value);
  });
}

function renderNavSuggestions(query) {
  if (!navSuggestions) return;
  const q = (query || '').trim().toLowerCase();
  if (!q) { navSuggestions.classList.remove('show'); navSuggestions.innerHTML = ''; return; }
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