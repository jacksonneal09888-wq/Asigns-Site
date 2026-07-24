document.addEventListener('DOMContentLoaded', () => {
  const ORDERS_API_URL = 'https://asigns-worker.jacksonneal09888.workers.dev/api/orders';

  const PRODUCTS = [
    { id: 'dtf-22x24', cat: 'dtf', name: '22" × 24" DTF Gang Sheet', price: 20, unit: 'sheet', desc: 'Fast-turn size, no minimums. Build your layout in the Gang Sheet Builder.', icon: '🧵', link: 'gang-builder.html' },
    { id: 'dtf-22x36', cat: 'dtf', name: '22" × 36" DTF Gang Sheet', price: 30, unit: 'sheet', desc: 'Our most popular size — balanced space for full drops.', icon: '🧵', link: 'gang-builder.html', featured: true },
    { id: 'dtf-22x48', cat: 'dtf', name: '22" × 48" DTF Gang Sheet', price: 40, unit: 'sheet', desc: 'More room for bulk runs and multiple SKUs.', icon: '🧵', link: 'gang-builder.html' },
    { id: 'dtf-22x60', cat: 'dtf', name: '22" × 60" DTF Gang Sheet', price: 50, unit: 'sheet', desc: 'Max layout size for big product drops.', icon: '🧵', link: 'gang-builder.html' },
    { id: 'apparel-tee', cat: 'apparel', name: 'Custom T-Shirt', price: null, unit: 'shirt', desc: 'Design in the Tee Designer, then send us your mockup. 24-hour rush available.', icon: '👕', link: 'tee-designer.html' },
    { id: 'apparel-hoodie', cat: 'apparel', name: 'Custom Hoodie', price: null, unit: 'hoodie', desc: 'DTF or screen print on your choice of blank. Great for teams and events.', icon: '🧥' },
    { id: 'apparel-bulk', cat: 'apparel', name: 'Bulk Apparel Run', price: null, unit: 'run', desc: '25+ pieces with tiered pricing. Tell us quantity and garment style for a quote.', icon: '📦' },
    { id: 'signs-business', cat: 'signs', name: 'Business Sign', price: null, unit: 'sign', desc: 'Storefront and interior signage, designed and installed locally.', icon: '🪧' },
    { id: 'signs-banner', cat: 'signs', name: 'Banner / Flag', price: null, unit: 'banner', desc: 'Vibrant event and promo banners, indoor or outdoor rated.', icon: '🚩' },
    { id: 'signs-yard', cat: 'signs', name: 'Yard Sign', price: null, unit: 'sign', desc: 'Corrugated yard signs with stakes — great for real estate and events.', icon: '📍' },
    { id: 'signs-led', cat: 'signs', name: 'LED / Lighted Sign', price: null, unit: 'sign', desc: 'Illuminated signage for 24/7 storefront visibility.', icon: '💡' },
    { id: 'vehicle-wrap', cat: 'vehicle', name: 'Full or Partial Vehicle Wrap', price: null, unit: 'vehicle', desc: 'Turn your fleet into a mobile billboard with durable wrap film.', icon: '🚐' },
    { id: 'vehicle-magnet', cat: 'vehicle', name: 'Vehicle Magnets', price: null, unit: 'set', desc: 'Removable door magnets — quick branding for any vehicle.', icon: '🧲' },
    { id: 'vehicle-window', cat: 'vehicle', name: 'Window Graphics', price: null, unit: 'set', desc: 'Perforated or solid vinyl for storefront and vehicle windows.', icon: '🪟' },
    { id: 'vinyl-lettering', cat: 'vinyl', name: 'Custom Vinyl Lettering', price: null, unit: 'set', desc: 'Cut vinyl text and logos for walls, doors, and equipment.', icon: '✂️' },
    { id: 'vinyl-decal', cat: 'vinyl', name: 'Die-Cut Decals / Stickers', price: null, unit: 'set', desc: 'Custom shaped decals for products, packaging, or promo.', icon: '🏷️' },
  ];

  const CATEGORY_LABEL = {
    dtf: 'DTF Gang Sheets',
    apparel: 'Custom Apparel',
    signs: 'Signs & Banners',
    vehicle: 'Vehicle Graphics',
    vinyl: 'Vinyl & Lettering',
  };

  const shopGrid = document.getElementById('shopGrid');
  const filterButtons = document.querySelectorAll('.shop-filter');
  const cartTray = document.getElementById('cartTray');
  const cartToggle = document.getElementById('cartToggle');
  const cartPanel = document.getElementById('cartPanel');
  const cartItemsEl = document.getElementById('cartItems');
  const cartCountEl = document.getElementById('cartCount');
  const cartTotalEl = document.getElementById('cartTotal');
  const cartCheckoutBtn = document.getElementById('cartCheckoutBtn');

  const orderSheet = document.getElementById('orderSheet');
  const orderSheetBackdrop = document.getElementById('orderSheetBackdrop');
  const orderSheetClose = document.getElementById('orderSheetClose');
  const orderSheetItems = document.getElementById('orderSheetItems');
  const orderSheetForm = document.getElementById('orderSheetForm');
  const orderSheetFeedback = document.getElementById('orderSheetFeedback');

  let cart = {}; // id -> qty

  function formatPrice(product) {
    return product.price === null ? 'TBD — contact for quote' : `$${product.price} / ${product.unit}`;
  }

  function renderProducts(filter) {
    shopGrid.innerHTML = '';
    const list = filter === 'all' ? PRODUCTS : PRODUCTS.filter((p) => p.cat === filter);

    list.forEach((product) => {
      const card = document.createElement('article');
      card.className = 'shop-card' + (product.featured ? ' shop-card--featured' : '');
      card.innerHTML = `
        ${product.featured ? '<span class="shop-card__badge">Most Popular</span>' : ''}
        <div class="shop-card__icon">${product.icon}</div>
        <span class="shop-card__cat">${CATEGORY_LABEL[product.cat]}</span>
        <h3>${product.name}</h3>
        <p>${product.desc}</p>
        <span class="shop-card__price">${formatPrice(product)}</span>
        <div class="shop-card__actions">
          <button class="btn btn-small shop-add-btn" data-id="${product.id}">Add to Cart</button>
          ${product.link ? `<a href="${product.link}" class="shop-card__tool-link">Open design tool →</a>` : ''}
        </div>
      `;
      shopGrid.appendChild(card);
    });

    shopGrid.querySelectorAll('.shop-add-btn').forEach((btn) => {
      btn.addEventListener('click', () => addToCart(btn.dataset.id));
    });
  }

  function addToCart(id) {
    cart[id] = (cart[id] || 0) + 1;
    renderCart();
    cartPanel.classList.add('is-open');
    cartTray.classList.add('is-open');
  }

  function updateQty(id, delta) {
    cart[id] = (cart[id] || 0) + delta;
    if (cart[id] <= 0) delete cart[id];
    renderCart();
  }

  function renderCart() {
    const ids = Object.keys(cart);
    const count = ids.reduce((sum, id) => sum + cart[id], 0);
    cartCountEl.textContent = `${count} item${count === 1 ? '' : 's'}`;

    let total = 0;
    let hasQuoteItems = false;
    cartItemsEl.innerHTML = '';

    ids.forEach((id) => {
      const product = PRODUCTS.find((p) => p.id === id);
      if (!product) return;
      if (product.price === null) hasQuoteItems = true;
      else total += product.price * cart[id];

      const row = document.createElement('div');
      row.className = 'cart-item';
      row.innerHTML = `
        <span class="cart-item__name">${product.name}</span>
        <div class="cart-item__qty">
          <button class="cart-qty-btn" data-id="${id}" data-delta="-1">−</button>
          <span>${cart[id]}</span>
          <button class="cart-qty-btn" data-id="${id}" data-delta="1">+</button>
        </div>
        <span class="cart-item__price">${product.price === null ? 'TBD' : '$' + (product.price * cart[id])}</span>
      `;
      cartItemsEl.appendChild(row);
    });

    cartTotalEl.textContent = count === 0 ? '' : (total > 0 ? `$${total}${hasQuoteItems ? '+' : ''}` : 'Quote needed');

    cartItemsEl.querySelectorAll('.cart-qty-btn').forEach((btn) => {
      btn.addEventListener('click', () => updateQty(btn.dataset.id, Number(btn.dataset.delta)));
    });

    if (count === 0) {
      cartItemsEl.innerHTML = '<p class="cart-empty">Your cart is empty. Add products to request a quote.</p>';
    }
  }

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterButtons.forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      renderProducts(btn.dataset.filter);
    });
  });

  cartToggle.addEventListener('click', () => {
    cartPanel.classList.toggle('is-open');
  });

  cartCheckoutBtn.addEventListener('click', () => {
    if (!Object.keys(cart).length) return;
    openOrderSheet();
  });

  function openOrderSheet() {
    orderSheetItems.innerHTML = Object.keys(cart).map((id) => {
      const product = PRODUCTS.find((p) => p.id === id);
      return `<div class="order-sheet__item">${cart[id]} × ${product.name} — ${formatPrice(product)}</div>`;
    }).join('');
    orderSheet.classList.add('is-open');
  }

  function closeOrderSheet() {
    orderSheet.classList.remove('is-open');
    orderSheetFeedback.classList.add('hidden');
  }

  orderSheetBackdrop.addEventListener('click', closeOrderSheet);
  orderSheetClose.addEventListener('click', closeOrderSheet);

  orderSheetForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const items = Object.keys(cart).map((id) => {
      const product = PRODUCTS.find((p) => p.id === id);
      return { id, name: product.name, qty: cart[id], price: product.price };
    });

    const payload = {
      name: document.getElementById('shopCustomerName').value,
      email: document.getElementById('shopCustomerEmail').value,
      phone: document.getElementById('shopCustomerPhone').value,
      category: 'shop-cart',
      items,
      notes: document.getElementById('shopOrderNotes').value,
    };

    orderSheetFeedback.textContent = 'Sending your order request…';
    orderSheetFeedback.classList.remove('hidden');

    try {
      const res = await fetch(ORDERS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Request failed');
      orderSheetFeedback.textContent = "Thanks! We've got your order request and will follow up shortly.";
      cart = {};
      renderCart();
      orderSheetForm.reset();
    } catch (err) {
      orderSheetFeedback.textContent = `Something went wrong sending your request — please call or text us at 336-215-0518 instead.`;
    }
  });

  renderProducts('all');
  renderCart();
});
