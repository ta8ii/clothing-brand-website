(function(){
  const cart = JSON.parse(localStorage.getItem('toro_cart') || '[]');

  const summaryItems = document.getElementById('summary-items');
  const sumSubtotal = document.getElementById('sum-subtotal');
  const sumTotal = document.getElementById('sum-total');
  const shippingForm = document.getElementById('shipping-form');

  function money(n){ return `$${Number(n).toFixed(2)}`; }

  function renderSummary(){
    if (!summaryItems || !sumSubtotal || !sumTotal) return;
    summaryItems.innerHTML = '';
    let subtotal = 0;
    cart.forEach(item => {
      const line = item.price * item.quantity;
      subtotal += line;
      const div = document.createElement('div');
      div.className = 'summary-item';
      div.innerHTML = `
        <div class="summary-thumb"><img src="${item.image}" alt="${item.name}"></div>
        <div>
          <div class="summary-name">${item.name} × ${item.quantity}</div>
          <div class="summary-meta">Color: ${item.color} | Size: ${item.size || 'M'}</div>
        </div>
        <div class="summary-price">${money(line)}</div>
      `;
      summaryItems.appendChild(div);
    });
    sumSubtotal.textContent = money(subtotal);
    sumTotal.textContent = money(subtotal); // shipping free
  }

  function isNonEmpty(value){ return String(value || '').trim().length > 1; }
  function isEmail(value){ return /.+@.+\..+/.test(String(value || '')); }

  if (shippingForm) {
    shippingForm.addEventListener('submit', function(e){
      e.preventDefault();
      const data = {
        first: document.getElementById('first-name')?.value,
        last: document.getElementById('last-name')?.value,
        email: document.getElementById('email')?.value,
        phone: document.getElementById('phone')?.value,
        address: document.getElementById('address')?.value,
        city: document.getElementById('city')?.value,
        state: document.getElementById('state')?.value,
        zip: document.getElementById('zip')?.value,
        cardName: document.getElementById('card-name')?.value,
        cardNumber: document.getElementById('card-number')?.value,
        exp: document.getElementById('exp')?.value,
        cvc: document.getElementById('cvc')?.value,
      };

      const requiredOk = [data.first, data.last, data.email, data.address, data.city, data.state, data.zip, data.cardName, data.cardNumber, data.exp, data.cvc]
        .every(isNonEmpty);
      if (!requiredOk || !isEmail(data.email)) {
        alert('Please fill all required fields with valid information.');
        return;
      }

      // Simulate processing
      alert('Thank you! Your order has been placed.');
      try { localStorage.removeItem('toro_cart'); } catch(_) {}
      window.location.href = 'clothes.html';
    });
  }

  document.addEventListener('DOMContentLoaded', renderSummary);
  renderSummary();
})();

