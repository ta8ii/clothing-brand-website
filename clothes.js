// ======= Nav toggle =======
const toggle = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");
if (toggle && navLinks) {
  toggle.addEventListener("click", () => {
    navLinks.classList.toggle("show");
  });
}

// ======= Filters =======
const sortBySelect = document.getElementById("sort-by");
const availabilitySelect = document.getElementById("availability");
const priceRangeSelect = document.getElementById("price-range");
const categoryFilterSelect = document.getElementById("category-filter");
const productGrid = document.querySelector(".product-grid");
const searchInput = document.getElementById("search-input");
const searchToggle = document.getElementById("search-toggle");
const navSearch = document.getElementById("nav-search");
const navSearchInput = document.getElementById("nav-search-input");
const navSearchClose = document.getElementById("nav-search-close");
const navSuggestions = document.getElementById("nav-suggestions");
const sidebarSuggestions = document.getElementById("sidebar-suggestions");

// Attach filter listeners (if controls exist)
[sortBySelect, availabilitySelect, priceRangeSelect, categoryFilterSelect]
  .filter(Boolean)
  .forEach((el) => el.addEventListener("change", filterProducts));

if (searchInput) {
  searchInput.addEventListener("input", () => {
    filterProducts();
    renderSuggestions(searchInput.value, sidebarSuggestions);
  });
}

// Toggle navbar search dropdown
if (searchToggle && navSearch) {
  searchToggle.addEventListener("click", () => {
    navSearch.classList.toggle("active");
    if (navSearch.classList.contains("active")) {
      setTimeout(() => navSearchInput && navSearchInput.focus(), 50);
    }
  });
}

if (navSearchClose && navSearch) {
  navSearchClose.addEventListener("click", () => navSearch.classList.remove("active"));
}

// Sync inputs both ways
if (navSearchInput) {
  navSearchInput.addEventListener("input", () => {
    if (searchInput) searchInput.value = navSearchInput.value;
    filterProducts();
    renderSuggestions(navSearchInput.value, navSuggestions);
  });
}
if (searchInput) {
  searchInput.addEventListener("input", () => {
    if (navSearchInput && navSearchInput.value !== searchInput.value) {
      navSearchInput.value = searchInput.value;
    }
  });
}

// Close nav search with ESC or clicking outside
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && navSearch?.classList.contains("active")) {
    navSearch.classList.remove("active");
  }
});
document.addEventListener("click", (e) => {
  if (!navSearch?.classList.contains("active")) return;
  const inner = e.target.closest(".nav-search-inner");
  const isToggle = e.target.closest("#search-toggle");
  if (!inner && !isToggle) navSearch.classList.remove("active");
});

// Build suggestions from current DOM products
function getAllProductTexts() {
  return Array.from(document.querySelectorAll('.product-card')).map((card) => {
    const name = card.querySelector('h3')?.textContent?.trim() || '';
    const category = card.querySelector('.product-category')?.textContent?.trim() || '';
    return { name, category };
  });
}

function renderSuggestions(query, container) {
  if (!container) return;
  const q = (query || '').trim().toLowerCase();
  if (!q) { container.classList.remove('show'); container.innerHTML = ''; return; }
  const products = getAllProductTexts();
  const pool = Array.from(new Set(products.flatMap(p => [p.name, p.category]).filter(Boolean)));
  const matches = pool.filter(text => text.toLowerCase().includes(q)).slice(0, 6);
  if (matches.length === 0) { container.classList.remove('show'); container.innerHTML = ''; return; }
  container.innerHTML = matches.map(m => `<div class="suggestion-item" data-suggest="${m.replace(/"/g,'&quot;')}">${m}</div>`).join('');
  container.classList.add('show');
}

// Click/keyboard on suggestions
document.addEventListener('click', (e) => {
  const item = e.target.closest('.suggestion-item');
  if (!item) return;
  const value = item.getAttribute('data-suggest') || '';
  if (navSearchInput && navSuggestions?.contains(item)) {
    navSearchInput.value = value;
    if (searchInput) searchInput.value = value;
    filterProducts();
    navSuggestions.classList.remove('show');
  }
  if (searchInput && sidebarSuggestions?.contains(item)) {
    searchInput.value = value;
    if (navSearchInput) navSearchInput.value = value;
    filterProducts();
    sidebarSuggestions.classList.remove('show');
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'Enter') return;
  const container = navSearch?.classList.contains('active') ? navSuggestions : sidebarSuggestions;
  if (!container || !container.classList.contains('show')) return;
  const items = Array.from(container.querySelectorAll('.suggestion-item'));
  if (items.length === 0) return;
  const activeIdx = items.findIndex(el => el.classList.contains('active'));
  if (e.key === 'ArrowDown') {
    const next = activeIdx < items.length - 1 ? activeIdx + 1 : 0;
    items.forEach(el => el.classList.remove('active'));
    items[next].classList.add('active');
    e.preventDefault();
  } else if (e.key === 'ArrowUp') {
    const prev = activeIdx > 0 ? activeIdx - 1 : items.length - 1;
    items.forEach(el => el.classList.remove('active'));
    items[prev].classList.add('active');
    e.preventDefault();
  } else if (e.key === 'Enter') {
    const target = items[activeIdx >= 0 ? activeIdx : 0];
    if (target) {
      const value = target.getAttribute('data-suggest') || '';
      if (navSearch?.classList.contains('active') && navSearchInput) {
        navSearchInput.value = value;
        if (searchInput) searchInput.value = value;
        filterProducts();
        navSuggestions.classList.remove('show');
      } else if (searchInput) {
        searchInput.value = value;
        if (navSearchInput) navSearchInput.value = value;
        filterProducts();
        sidebarSuggestions.classList.remove('show');
      }
      e.preventDefault();
    }
  }
});

// Hide suggestions when clicking outside
document.addEventListener('click', (e) => {
  if (navSuggestions && !e.target.closest('#nav-search')) {
    navSuggestions.classList.remove('show');
  }
  if (sidebarSuggestions && !e.target.closest('.filter-group')) {
    sidebarSuggestions.classList.remove('show');
  }
});

function parsePriceRange(value) {
  if (!value || value === "all") return [0, Infinity];
  if (value.includes("+")) {
    const min = parseFloat(value) || 0; // e.g. "50+" => 50 to Infinity
    return [min, Infinity];
  }
  const [minStr, maxStr] = value.split("-");
  const min = parseFloat(minStr) || 0;
  const max = parseFloat(maxStr) || Infinity;
  return [min, max];
}

// Filter + sort
function filterProducts() {
  if (!productGrid) return;

  const sortBy = sortBySelect ? sortBySelect.value : "featured";
  const availability = availabilitySelect ? availabilitySelect.value : "all";
  const priceRange = priceRangeSelect ? priceRangeSelect.value : "all";
  const category = categoryFilterSelect ? categoryFilterSelect.value : "all";
  const searchQuery = searchInput ? searchInput.value.trim().toLowerCase() : "";

  const [minPrice, maxPrice] = parsePriceRange(priceRange);

  const products = Array.from(document.querySelectorAll(".product-card"));

  // Filter
  let filteredProducts = products.filter((product) => {
    const categoryEl = product.querySelector(".product-category");
    const priceEl = product.querySelector(".current-price");
    if (!categoryEl || !priceEl) return false;

    const productCategory = categoryEl.textContent.toLowerCase();
    const title = (product.querySelector("h3")?.textContent || "").toLowerCase();
    const combined = `${title} ${productCategory}`;
    const currentPrice = parseFloat(
      priceEl.textContent.replace("$", "").trim()
    );

    // Category filter
    if (category !== "all" && !productCategory.includes(category.toLowerCase())) {
      return false;
    }

    // Price filter
    if (Number.isFinite(minPrice) && currentPrice < minPrice) return false;
    if (Number.isFinite(maxPrice) && currentPrice > maxPrice) return false;

    // Availability (demo: assume all in-stock)
    if (availability === "out-of-stock") return false;

    // Search filter
    if (searchQuery && !combined.includes(searchQuery)) return false;

    return true;
  });

  // Sort
  filteredProducts.sort((a, b) => {
    const nameA = (a.querySelector("h3")?.textContent || "").toLowerCase();
    const nameB = (b.querySelector("h3")?.textContent || "").toLowerCase();
    const priceA = parseFloat(
      (a.querySelector(".current-price")?.textContent || "").replace("$", "")
    );
    const priceB = parseFloat(
      (b.querySelector(".current-price")?.textContent || "").replace("$", "")
    );

    switch (sortBy) {
      case "price-low":
        return priceA - priceB;
      case "price-high":
        return priceB - priceA;
      case "name-az":
        return nameA.localeCompare(nameB);
      case "name-za":
        return nameB.localeCompare(nameA);
      case "newest": {
        // Optional: use data-date="2025-08-01" on .product-card
        const da = a.getAttribute("data-date") || "";
        const db = b.getAttribute("data-date") || "";
        return db.localeCompare(da); // newest first
      }
      default:
        return 0; // featured/original order
    }
  });

  // Re-render grid
  productGrid.innerHTML = "";
  filteredProducts.forEach((product) => productGrid.appendChild(product));

  // Animation
  filteredProducts.forEach((product, index) => {
    product.style.animation = `fadeInUp 0.5s ease ${index * 0.1}s both`;
  });
}

// ======= Wishlist (toggle heart) =======
document.addEventListener("click", function (e) {
  const btn = e.target.closest(".wishlist");
  if (!btn) return;
  const icon = btn.querySelector("i");
  if (!icon) return;

  if (icon.classList.contains("fa-regular")) {
    icon.classList.remove("fa-regular");
    icon.classList.add("fa-solid");
    icon.style.color = "#ff4757";
  } else {
    icon.classList.remove("fa-solid");
    icon.classList.add("fa-regular");
    icon.style.color = "";
  }
});

// ======= Favorites (persistent) =======
const favIcon = document.getElementById("fav-icon");
const favCount = document.getElementById("fav-count");
const favSidebar = document.getElementById("favorites-sidebar");
const favOverlay = document.getElementById("favorites-overlay");
const favClose = document.getElementById("close-favorites");
const favItems = document.getElementById("favorites-items");

let favorites = JSON.parse(localStorage.getItem("toro_favorites") || "[]");

function saveFavorites() {
  localStorage.setItem("toro_favorites", JSON.stringify(favorites));
}

function updateFavCount() {
  if (!favCount) return;
  const total = favorites.length;
  favCount.textContent = total > 0 ? String(total) : "";
  favCount.style.display = total > 0 ? "inline-flex" : "none";
}

function renderFavorites() {
  if (!favItems) return;
  favItems.innerHTML = "";
  favorites.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <div class="cart-item-image">
        <img src="${item.image}" alt="${item.name}" />
      </div>
      <div class="cart-item-details">
        <h4>${item.name}</h4>
        <p class="cart-item-color">${item.category || ''}</p>
        <p class="cart-item-price">${item.price || ''}</p>
        <div style="display:flex; gap:8px; margin-top:8px;">
          <button class="add-to-cart" data-fav-index="${index}">Add to Cart</button>
          <button class="remove-item" data-remove-fav="${index}"><i class="fa-solid fa-trash"></i></button>
        </div>
      </div>
    `;
    favItems.appendChild(div);
  });
}

function openFavorites() {
  if (!favSidebar || !favOverlay) return;
  renderFavorites();
  favSidebar.classList.add("active");
  favOverlay.classList.add("active");
}
function closeFavorites() {
  if (!favSidebar || !favOverlay) return;
  favSidebar.classList.remove("active");
  favOverlay.classList.remove("active");
}

if (favIcon) favIcon.addEventListener("click", openFavorites);
if (favClose) favClose.addEventListener("click", closeFavorites);
if (favOverlay) favOverlay.addEventListener("click", closeFavorites);

// Toggle favorites via product heart
document.addEventListener("click", function (e) {
  const heartBtn = e.target.closest(".wishlist");
  if (!heartBtn) return;
  const card = heartBtn.closest(".product-card");
  if (!card) return;
  const name = card.querySelector("h3")?.textContent || "Product";
  const price = card.querySelector(".current-price")?.textContent || "";
  const category = card.querySelector(".product-category")?.textContent || "";
  const image = card.querySelector(".product-image img")?.src || "";
  const key = `${name}|${image}`;

  const existsIndex = favorites.findIndex((f) => f.key === key);
  if (existsIndex >= 0) {
    favorites.splice(existsIndex, 1);
  } else {
    favorites.push({ key, name, price, category, image });
  }
  saveFavorites();
  updateFavCount();
});

// Favorites actions: add to cart / remove
document.addEventListener("click", function (e) {
  const addBtn = e.target.closest('[data-fav-index]');
  if (addBtn) {
    const idx = Number(addBtn.getAttribute('data-fav-index'));
    const fav = favorites[idx];
    if (fav) {
      addToCart(fav.name, fav.price || "$0.00", "Default", fav.image || "", 1);
    }
    return;
  }
  const removeBtn = e.target.closest('[data-remove-fav]');
  if (removeBtn) {
    const idx = Number(removeBtn.getAttribute('data-remove-fav'));
    favorites.splice(idx, 1);
    saveFavorites();
    updateFavCount();
    renderFavorites();
  }
});

// ======= Quick View -> Product Modal =======
const productModal = document.getElementById("product-modal");
const productModalOverlay = document.getElementById("product-modal-overlay");
const productModalClose = document.getElementById("product-modal-close");
const modalProductImage = document.getElementById("modal-product-image");
const modalProductName = document.getElementById("modal-product-name");
const modalProductCategory = document.getElementById("modal-product-category");
const modalProductPrice = document.getElementById("modal-product-price");
const modalProductOldPrice = document.getElementById("modal-product-old-price");
const modalColorButtons = document.getElementById("modal-color-buttons");
const modalQtyEl = document.getElementById("modal-qty");
const modalQtyMinus = document.getElementById("modal-qty-minus");
const modalQtyPlus = document.getElementById("modal-qty-plus");
const modalAddToCartBtn = document.getElementById("modal-add-to-cart");
const modalStars = document.getElementById("modal-stars");
const modalReviews = document.getElementById("modal-reviews");
const modalSku = document.getElementById("modal-sku");
const modalStock = document.getElementById("modal-stock");
const modalSizeButtons = document.getElementById("modal-size-buttons");

let modalSelectedColor = "Default";
let modalQuantity = 1;
let modalSelectedSize = "M";

function openProductModalFromCard(card) {
  if (!productModal || !card) return;
  const name = card.querySelector("h3")?.textContent || "Product";
  const price = card.querySelector(".current-price")?.textContent || "$0.00";
  const oldPrice = card.querySelector(".old-price")?.textContent || "";
  const category = card.querySelector(".product-category")?.textContent || "";
  const image = card.querySelector(".product-image img")?.src || "";
  const sku = `SKU-${Math.abs(hashString(name)).toString().slice(0,6)}`;
  const inStock = true;
  const rating = 4.5;
  const reviewsCount = 128;

  // Fill content
  modalProductImage.src = image;
  modalProductImage.alt = name;
  modalProductName.textContent = name;
  modalProductCategory.textContent = category;
  modalProductPrice.textContent = price;
  modalProductOldPrice.textContent = oldPrice;
  modalSku.textContent = sku;
  modalStock.textContent = inStock ? "In stock" : "Out of stock";
  modalStock.className = inStock ? "stock-badge" : "stock-badge out";
  renderStars(rating, reviewsCount);

  // Build color buttons from the card
  modalColorButtons.innerHTML = "";
  const cardColors = card.querySelectorAll(".color-btn");
  if (cardColors.length) {
    cardColors.forEach((btn) => {
      const color = btn.getAttribute("data-color") || "Default";
      const bg = btn.style.backgroundColor || window.getComputedStyle(btn).backgroundColor;
      const border = btn.style.border || window.getComputedStyle(btn).border;
      const clone = document.createElement("button");
      clone.className = "color-btn";
      clone.setAttribute("data-color", color);
      clone.style.backgroundColor = bg;
      if (border) clone.style.border = border;
      modalColorButtons.appendChild(clone);
    });
  }

  // Default selected color (match active in card or first)
  const activeCardColor = card.querySelector(".color-btn.active");
  const firstModalColor = modalColorButtons.querySelector(".color-btn");
  modalSelectedColor = activeCardColor?.getAttribute("data-color") || firstModalColor?.getAttribute("data-color") || "Default";
  if (firstModalColor) {
    // set active state on corresponding modal color
    const toActivate = Array.from(modalColorButtons.querySelectorAll(".color-btn")).find(
      (b) => b.getAttribute("data-color") === modalSelectedColor
    ) || firstModalColor;
    toActivate.classList.add("active");
  }

  // Reset quantity
  modalQuantity = 1;
  if (modalQtyEl) modalQtyEl.textContent = String(modalQuantity);
  // Reset size
  modalSelectedSize = modalSizeButtons?.querySelector('.size-btn.active')?.getAttribute('data-size') || 'M';

  // Store current context on the modal button for add-to-cart
  modalAddToCartBtn.dataset.name = name;
  modalAddToCartBtn.dataset.price = price;
  modalAddToCartBtn.dataset.image = image;

  productModal.classList.add("active");
  productModal.setAttribute("aria-hidden", "false");
}

document.addEventListener("click", function (e) {
  const btn = e.target.closest(".quick-view");
  if (!btn) return;
  const card = btn.closest(".product-card");
  openProductModalFromCard(card);
});

function renderStars(ratingValue, reviewsCount) {
  if (!modalStars) return;
  const fullStars = Math.floor(ratingValue);
  const halfStar = ratingValue - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  let html = "";
  for (let i = 0; i < fullStars; i++) html += '<i class="fa-solid fa-star"></i>';
  if (halfStar) html += '<i class="fa-solid fa-star-half-stroke"></i>';
  for (let i = 0; i < emptyStars; i++) html += '<i class="fa-regular fa-star"></i>';
  modalStars.innerHTML = html;
  if (modalReviews) modalReviews.textContent = `(${reviewsCount} reviews)`;
}

function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i);
  return h | 0;
}

// Close modal
function closeProductModal() {
  if (!productModal) return;
  productModal.classList.remove("active");
  productModal.setAttribute("aria-hidden", "true");
}

if (productModalOverlay) {
  productModalOverlay.addEventListener("click", closeProductModal);
}
if (productModalClose) {
  productModalClose.addEventListener("click", closeProductModal);
}

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") closeProductModal();
});

// Modal color selection
document.addEventListener("click", function (e) {
  const colorBtn = e.target.closest(".product-modal .color-btn");
  if (!colorBtn || !productModal?.classList.contains("active")) return;
  modalColorButtons.querySelectorAll(".color-btn").forEach((b) => b.classList.remove("active"));
  colorBtn.classList.add("active");
  modalSelectedColor = colorBtn.getAttribute("data-color") || "Default";
});

// Modal size selection
document.addEventListener("click", function (e) {
  const sizeBtn = e.target.closest(".product-modal .size-btn");
  if (!sizeBtn || !productModal?.classList.contains("active")) return;
  modalSizeButtons.querySelectorAll(".size-btn").forEach((b) => b.classList.remove("active"));
  sizeBtn.classList.add("active");
  modalSelectedSize = sizeBtn.getAttribute("data-size") || "M";
});

// Modal quantity controls
if (modalQtyMinus) {
  modalQtyMinus.addEventListener("click", function () {
    modalQuantity = Math.max(1, modalQuantity - 1);
    modalQtyEl.textContent = String(modalQuantity);
  });
}
if (modalQtyPlus) {
  modalQtyPlus.addEventListener("click", function () {
    modalQuantity += 1;
    modalQtyEl.textContent = String(modalQuantity);
  });
}

// Modal add to cart
if (modalAddToCartBtn) {
  modalAddToCartBtn.addEventListener("click", function () {
    const name = this.dataset.name || "Product";
    const price = this.dataset.price || "$0.00";
    const image = this.dataset.image || "";
    const color = modalSelectedColor || "Default";
    const qty = modalQuantity || 1;
    addToCart(name, price, color, image, qty, modalSelectedSize);
    closeProductModal();
  });
}

// ======= Color buttons (active state) =======
document.addEventListener("click", function (e) {
  const colorBtn = e.target.closest(".color-btn");
  if (!colorBtn) return;

  const card = colorBtn.closest(".product-card");
  const all = card?.querySelectorAll(".color-btn") || [];
  all.forEach((b) => b.classList.remove("active"));
  colorBtn.classList.add("active");
});

// ======= Cart =======
let cart = JSON.parse(localStorage.getItem("toro_cart") || "[]");
let cartTotal = 0;

function saveCart() {
  try {
    localStorage.setItem("toro_cart", JSON.stringify(cart));
  } catch (_) {}
}

function addToCart(productName, productPrice, selectedColor, productImage, quantityOverride, selectedSize) {
  const existingItem = cart.find(
    (item) => item.name === productName && item.color === selectedColor && item.size === (selectedSize || "M")
  );

  if (existingItem) {
    existingItem.quantity += quantityOverride ? Number(quantityOverride) : 1;
  } else {
    cart.push({
      name: productName,
      price: parseFloat(String(productPrice).replace("$", "")),
      color: selectedColor || "Default",
      size: selectedSize || "M",
      image: productImage,
      quantity: quantityOverride ? Number(quantityOverride) : 1,
    });
  }

  updateCartDisplay();
  updateCartCount(); // <-- shows/hides the badge
  saveCart();
}

function updateCartCount() {
  const cartCount = document.getElementById("cart-count"); // <span id="cart-count" class="cart-count"></span>
  if (!cartCount) return;

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  // Show when > 0, hide when 0
  cartCount.textContent = totalItems > 0 ? String(totalItems) : "";
  cartCount.style.display = totalItems > 0 ? "inline-flex" : "none";
}

function updateCartDisplay() {
  const cartItems = document.getElementById("cart-items");
  const totalAmount = document.getElementById("total-amount");
  if (!cartItems || !totalAmount) return;

  cartItems.innerHTML = "";
  cartTotal = 0;

  cart.forEach((item, index) => {
    cartTotal += item.price * item.quantity;

    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <div class="cart-item-image">
        <img src="${item.image}" alt="${item.name}" />
      </div>
      <div class="cart-item-details">
        <h4>${item.name}</h4>
        <p class="cart-item-color">Color: ${item.color} | Size: ${item.size || 'M'}</p>
        <p class="cart-item-price">$${item.price.toFixed(2)}</p>
        <div class="cart-item-quantity">
          <button class="quantity-btn minus" onclick="updateQuantity(${index}, -1)">-</button>
          <span>${item.quantity}</span>
          <button class="quantity-btn plus" onclick="updateQuantity(${index}, 1)">+</button>
        </div>
      </div>
      <button class="remove-item" onclick="removeFromCart(${index})">
        <i class="fa-solid fa-trash"></i>
      </button>
    `;
    cartItems.appendChild(div);
  });

  totalAmount.textContent = `$${cartTotal.toFixed(2)}`;
}

function updateQuantity(index, change) {
  cart[index].quantity += change;
  if (cart[index].quantity <= 0) cart.splice(index, 1);
  updateCartDisplay();
  updateCartCount();
  saveCart();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  updateCartDisplay();
  updateCartCount();
  saveCart();
}

// ======= Cart open/close =======
const cartIcon = document.getElementById("cart-icon");
const cartSidebar = document.getElementById("cart-sidebar");
const cartOverlay = document.getElementById("cart-overlay");
const closeCart = document.getElementById("close-cart");

if (cartIcon && cartSidebar && cartOverlay) {
  cartIcon.addEventListener("click", function () {
    cartSidebar.classList.add("active");
    cartOverlay.classList.add("active");
  });
}
if (closeCart && cartSidebar && cartOverlay) {
  closeCart.addEventListener("click", function () {
    cartSidebar.classList.remove("active");
    cartOverlay.classList.remove("active");
  });
}
if (cartOverlay && cartSidebar) {
  cartOverlay.addEventListener("click", function () {
    cartSidebar.classList.remove("active");
    cartOverlay.classList.remove("active");
  });
}

// ======= Add-to-cart (with safer color fallback) =======
document.addEventListener("click", function (e) {
  const btn = e.target.closest(".add-to-cart");
  if (!btn) return;
  // Ignore modal's add-to-cart here; it's handled by its own listener
  if (btn.id === "modal-add-to-cart") return;

  const card = btn.closest(".product-card");
  if (!card) return; // safety: only handle product card buttons
  const name = card?.querySelector("h3")?.textContent || "Product";
  const price = card?.querySelector(".current-price")?.textContent || "$0.00";
  const colorEl =
    card?.querySelector(".color-btn.active") || card?.querySelector(".color-btn");
  const selectedColor = colorEl ? colorEl.getAttribute("data-color") : "Default";
  const image = card?.querySelector(".product-image img")?.src || "";

  const originalText = btn.textContent;
  btn.textContent = "Added!";
  btn.style.background = "#28a745";

  addToCart(name, price, selectedColor, image, 1, undefined);

  setTimeout(() => {
    btn.textContent = originalText;
    btn.style.background = "";
  }, 2000);
});

// ======= Checkout =======
const checkoutBtn = document.getElementById("checkout-btn");
if (checkoutBtn) {
  checkoutBtn.addEventListener("click", function () {
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }
    saveCart();
    window.location.href = "checkout.html";
  });
}

// ======= Init on load =======
document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();   // ensures badge starts hidden if 0
  updateCartDisplay(); // render saved cart on load
  // filterProducts(); // optional: render with current filters on load
  updateFavCount();
  // Seed search from URL if provided
  try {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("search");
    if (q && (searchInput || navSearchInput)) {
      if (searchInput) searchInput.value = q;
      if (navSearchInput) navSearchInput.value = q;
      filterProducts();
      const productsSection = document.querySelector('.products');
      if (productsSection) productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  } catch (_) {}
});
