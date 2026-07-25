document.addEventListener('DOMContentLoaded', () => {
  const ORDERS_API_URL = 'https://asigns-worker.jacksonneal09888.workers.dev/api/orders';

  const PRODUCTS = [
    // DTF Gang Sheets
    { id: 'dtf-22x24', cat: 'dtf', name: '22" × 24" DTF Gang Sheet', price: 20, unit: 'sheet', desc: 'Fast-turn size, no minimums. Build your layout in the Gang Sheet Builder.', icon: '🧵', link: 'gang-builder.html' },
    { id: 'dtf-22x36', cat: 'dtf', name: '22" × 36" DTF Gang Sheet', price: 30, unit: 'sheet', desc: 'Our most popular size — balanced space for full drops.', icon: '🧵', link: 'gang-builder.html', featured: true },
    { id: 'dtf-22x48', cat: 'dtf', name: '22" × 48" DTF Gang Sheet', price: 40, unit: 'sheet', desc: 'More room for bulk runs and multiple SKUs.', icon: '🧵', link: 'gang-builder.html' },
    { id: 'dtf-22x60', cat: 'dtf', name: '22" × 60" DTF Gang Sheet', price: 50, unit: 'sheet', desc: 'Max layout size for big product drops.', icon: '🧵', link: 'gang-builder.html' },

    // Signs & Banners
    { id: 'signs-yard', cat: 'signs', name: 'Yard Signs (18"x24")', price: 15, unit: 'each', desc: 'Corrugated yard signs with stakes — great for real estate and events.', icon: '📍', image: 'Material/IMG_5010.jpeg' },
    { id: 'signs-corrugated', cat: 'signs', name: 'Corrugated Plastic Signs', price: 15, unit: 'sign', startingAt: true, desc: 'Lightweight, weatherproof signage for temporary or seasonal use.', icon: '🪧' },
    { id: 'signs-pvc', cat: 'signs', name: 'PVC Signs', price: 45, unit: 'sign', startingAt: true, desc: 'Rigid, smooth-finish signs for indoor or outdoor display.', icon: '🪧' },
    { id: 'signs-aluminum', cat: 'signs', name: 'Aluminum Signs', price: 65, unit: 'sign', startingAt: true, desc: 'Durable metal signage built to hold up outdoors for years.', icon: '🪧' },
    { id: 'signs-acm', cat: 'signs', name: 'ACM (Dibond) Signs', price: 85, unit: 'sign', startingAt: true, desc: 'Premium aluminum composite panel signage with a sharp, modern finish.', icon: '🪧' },
    { id: 'signs-storefront', cat: 'signs', name: 'Storefront Signs', price: null, desc: 'Custom-designed and installed signage for your business exterior.', icon: '🏪' },
    { id: 'signs-monument', cat: 'signs', name: 'Monument Signs', price: null, desc: 'Freestanding ground-level signage for entrances and business parks.', icon: '🏛️' },
    { id: 'signs-realestate', cat: 'signs', name: 'Real Estate Signs', price: 20, unit: 'sign', startingAt: true, desc: 'For sale, for rent, and open house signage with rider options.', icon: '🏠' },
    { id: 'signs-construction', cat: 'signs', name: 'Construction Signs', price: 65, unit: 'sign', startingAt: true, desc: 'Job site and safety signage built for outdoor conditions.', icon: '🚧' },
    { id: 'signs-magnetic', cat: 'signs', name: 'Magnetic Vehicle Signs', price: 75, unit: 'pair', startingAt: true, desc: 'Removable door magnets — quick branding for any vehicle.', icon: '🧲' },
    { id: 'signs-vinylbanner', cat: 'signs', name: 'Vinyl Banners', price: 6.50, unit: 'sq. ft.', desc: 'Vibrant, durable banners for events, sales, and grand openings.', icon: '🚩' },
    { id: 'signs-meshbanner', cat: 'signs', name: 'Mesh Banners', price: 8.00, unit: 'sq. ft.', desc: 'Wind-resistant mesh vinyl, ideal for fences and large outdoor spans.', icon: '🚩' },
    { id: 'signs-retractable', cat: 'signs', name: 'Retractable Banners', price: 165, unit: 'banner', startingAt: true, desc: 'Portable roll-up banner stands for trade shows and storefronts.', icon: '📊' },

    // Vinyl Lettering
    { id: 'vinyl-door', cat: 'vinyl', name: 'Door Lettering', price: 45, unit: 'door', startingAt: true, desc: 'Business name and hours lettering for storefront doors.', icon: '✂️' },
    { id: 'vinyl-window', cat: 'vinyl', name: 'Window Lettering', price: 55, unit: 'window', startingAt: true, desc: 'Cut vinyl text and logos applied directly to storefront glass.', icon: '🪟', image: 'Material/LA JAROCHA-1.png' },
    { id: 'vinyl-hours', cat: 'vinyl', name: 'Store Hours', price: 35, unit: 'sign', startingAt: true, desc: 'Simple vinyl hours-of-operation decal for your entrance.', icon: '🕒' },
    { id: 'vinyl-wall', cat: 'vinyl', name: 'Wall Lettering', price: 85, unit: 'wall', startingAt: true, desc: 'Interior wall graphics and lettering for offices and lobbies.', icon: '✂️' },
    { id: 'vinyl-reflective', cat: 'vinyl', name: 'Reflective Vinyl', price: null, desc: 'High-visibility reflective lettering and graphics for safety use.', icon: '✨' },

    // Vehicle Graphics
    { id: 'vehicle-doorlogo', cat: 'vehicle', name: 'Door Logos', price: 95, unit: 'set', desc: 'Logo decals for both driver and passenger doors.', icon: '🚗' },
    { id: 'vehicle-lettering', cat: 'vehicle', name: 'Vehicle Lettering', price: 175, unit: 'vehicle', startingAt: true, desc: 'Business name, phone number, and services lettered on your vehicle.', icon: '🚗', image: 'Material/IMG_5482.jpeg' },
    { id: 'vehicle-partial', cat: 'vehicle', name: 'Partial Wrap', price: 850, unit: 'vehicle', startingAt: true, desc: 'Targeted coverage wrap for maximum branding on a budget.', icon: '🚐' },
    { id: 'vehicle-half', cat: 'vehicle', name: 'Half Wrap', price: 1500, unit: 'vehicle', startingAt: true, desc: 'Roughly half the vehicle wrapped for stronger brand presence.', icon: '🚐' },
    { id: 'vehicle-fullcar', cat: 'vehicle', name: 'Full Car Wrap', price: 2500, unit: 'vehicle', startingAt: true, desc: 'Full coverage wrap turning your car into a mobile billboard.', icon: '🚗' },
    { id: 'vehicle-fullpickup', cat: 'vehicle', name: 'Full Pickup Wrap', price: 2900, unit: 'vehicle', startingAt: true, desc: 'Complete wrap coverage for pickup trucks.', icon: '🛻', image: 'Material/0dd1a7f8-be16-44ec-a731-c8d05d20c307.jpeg' },
    { id: 'vehicle-cargovan', cat: 'vehicle', name: 'Cargo Van Wrap', price: 3000, unit: 'vehicle', startingAt: true, desc: 'Full wrap coverage for cargo and service vans.', icon: '🚐', image: 'Material/ccm-heat-air-van.jpg' },
    { id: 'vehicle-boxtruck', cat: 'vehicle', name: 'Box Truck Wrap', price: 3800, unit: 'vehicle', startingAt: true, desc: 'Full wrap coverage for box trucks — maximum highway visibility.', icon: '🚚', image: 'Material/cristo-viene-pronto-truck.jpg' },
    { id: 'vehicle-trailer', cat: 'vehicle', name: 'Trailer Wrap', price: 2500, unit: 'vehicle', startingAt: true, desc: 'Full wrap coverage for enclosed and cargo trailers.', icon: '🚛', image: 'Material/IMG_5250.jpeg' },

    // Window Tint
    { id: 'tint-front2', cat: 'tint', name: '2 Front Windows', price: 99, unit: 'vehicle', desc: 'Driver and passenger front window tint.', icon: '🚙' },
    { id: 'tint-sedan', cat: 'tint', name: 'Sedan (Full Vehicle)', price: 250, unit: 'vehicle', startingAt: true, desc: 'Full vehicle window tint package for sedans.', icon: '🚗' },
    { id: 'tint-suv', cat: 'tint', name: 'SUV (Full Vehicle)', price: 300, unit: 'vehicle', startingAt: true, desc: 'Full vehicle window tint package for SUVs.', icon: '🚙' },
    { id: 'tint-pickup', cat: 'tint', name: 'Pickup (Full Vehicle)', price: 250, unit: 'vehicle', startingAt: true, desc: 'Full vehicle window tint package for pickup trucks.', icon: '🛻' },
    { id: 'tint-commercial', cat: 'tint', name: 'Commercial Vehicles', price: null, desc: 'Window tint for fleet and commercial vehicles.', icon: '🚚' },

    // Printing Services
    { id: 'print-businesscards', cat: 'printing', name: 'Business Cards (500)', price: 59, unit: '500-pack', desc: 'Full-color business cards, ready in-house.', icon: '💳' },
    { id: 'print-flyers', cat: 'printing', name: 'Flyers (100)', price: 69, unit: '100-pack', desc: 'Full-color flyers for promotions and events.', icon: '📄' },
    { id: 'print-postcards', cat: 'printing', name: 'Postcards', price: 79, unit: 'pack', startingAt: true, desc: 'Direct-mail ready postcards in a range of sizes.', icon: '📮' },
    { id: 'print-brochures', cat: 'printing', name: 'Brochures', price: 199, unit: 'pack', startingAt: true, desc: 'Folded, full-color brochures for marketing and menus.', icon: '📖' },
    { id: 'print-rackcards', cat: 'printing', name: 'Rack Cards', price: 89, unit: 'pack', startingAt: true, desc: 'Display-rack ready cards for lobbies and storefronts.', icon: '📇' },
    { id: 'print-stickers', cat: 'printing', name: 'Stickers', price: 45, unit: 'pack', startingAt: true, desc: 'Custom die-cut or sheet stickers for products and promo.', icon: '🏷️' },
    { id: 'print-labels', cat: 'printing', name: 'Labels', price: 55, unit: 'pack', startingAt: true, desc: 'Product and packaging labels, custom shapes available.', icon: '🏷️' },
    { id: 'print-posters', cat: 'printing', name: 'Posters', price: 20, unit: 'each', startingAt: true, desc: 'Large-format posters for events and displays.', icon: '🖼️' },
    { id: 'print-blueprints', cat: 'printing', name: 'Blueprints', price: 5, unit: 'each', startingAt: true, desc: 'Large-format blueprint and technical drawing prints.', icon: '📐' },

    // Custom Apparel
    { id: 'apparel-tee', cat: 'apparel', name: 'Custom T-Shirts', price: 15.99, unit: 'shirt', startingAt: true, desc: 'Design in the Tee Designer, then send us your mockup. 24-hour rush available.', icon: '👕', link: 'tee-designer.html', image: 'Material/taquiza-lupita-tee.png' },
    { id: 'apparel-richardson', cat: 'apparel', name: 'Richardson Hats', price: 16.99, unit: 'hat', startingAt: true, desc: 'Custom Richardson trucker hats with embroidery or patch options.', icon: '🧢' },
    { id: 'apparel-embroidered', cat: 'apparel', name: 'Embroidered Hats', price: 19.95, unit: 'hat', startingAt: true, desc: 'Premium embroidered hats — built to last, made to represent.', icon: '🧢' },
    { id: 'apparel-polo', cat: 'apparel', name: 'Polo Shirts', price: 29.95, unit: 'shirt', startingAt: true, desc: 'Embroidered or printed polos for staff and teams.', icon: '👔' },
    { id: 'apparel-hoodie', cat: 'apparel', name: 'Hoodies', price: 35, unit: 'hoodie', startingAt: true, desc: 'DTF or screen print on your choice of blank. Great for teams and events.', icon: '🧥' },
    { id: 'apparel-safety', cat: 'apparel', name: 'Safety Shirts', price: 18, unit: 'shirt', startingAt: true, desc: 'High-visibility safety shirts for job sites and crews.', icon: '🦺' },
    { id: 'apparel-uniforms', cat: 'apparel', name: 'Team Uniforms', price: null, desc: '25+ pieces with tiered pricing. Tell us quantity and garment style for a quote.', icon: '📦' },

    // Graphic Design
    { id: 'design-logo', cat: 'design', name: 'Logo Design', price: 150, unit: 'design', startingAt: true, desc: 'Custom logo design with revisions and final source files.', icon: '🎨' },
    { id: 'design-bizcard', cat: 'design', name: 'Business Card Design', price: 40, unit: 'design', desc: 'Print-ready business card design to match your brand.', icon: '💳' },
    { id: 'design-flyer', cat: 'design', name: 'Flyer Design', price: 65, unit: 'design', desc: 'Custom flyer layout and design, print-ready.', icon: '📄' },
    { id: 'design-banner', cat: 'design', name: 'Banner Design', price: 65, unit: 'design', desc: 'Custom banner artwork sized and ready for print.', icon: '🚩' },
    { id: 'design-social', cat: 'design', name: 'Social Media Ad', price: 45, unit: 'design', desc: 'Custom graphic sized for social media promotion.', icon: '📱' },
    { id: 'design-menu', cat: 'design', name: 'Menu Design', price: 95, unit: 'design', startingAt: true, desc: 'Restaurant and food service menu design, print-ready.', icon: '📋' },

    // Website Creation
    { id: 'web-onepage', cat: 'web', name: 'One-Page Website', price: 399, unit: 'site', startingAt: true, desc: 'A single-page site to get your business online fast.', icon: '💻' },
    { id: 'web-5page', cat: 'web', name: '5-Page Business Website', price: 799, unit: 'site', startingAt: true, desc: 'A full small-business site — home, about, services, and more.', icon: '💻' },
    { id: 'web-ecommerce', cat: 'web', name: 'E-Commerce Website', price: 1499, unit: 'site', startingAt: true, desc: 'A full online store with product listings and checkout.', icon: '🛒' },
    { id: 'web-redesign', cat: 'web', name: 'Website Redesign', price: 499, unit: 'site', startingAt: true, desc: 'Modernize and refresh an existing website.', icon: '💻' },
    { id: 'web-domain', cat: 'web', name: 'Domain Name Setup', price: 50, unit: 'setup', startingAt: true, desc: 'Domain purchase and setup handled for you.', icon: '🌐' },
    { id: 'web-hosting', cat: 'web', name: 'Web Hosting Setup', price: 100, unit: 'setup', startingAt: true, desc: 'Hosting account setup and configuration.', icon: '🌐' },
    { id: 'web-gbp', cat: 'web', name: 'Google Business Profile Setup', price: 150, unit: 'setup', startingAt: true, desc: 'Get your business set up and optimized on Google.', icon: '📍' },
    { id: 'web-maintenance', cat: 'web', name: 'Website Maintenance', price: 75, unit: 'month', startingAt: true, desc: 'Ongoing updates, backups, and support for your site.', icon: '🔧' },

    // Business Branding
    { id: 'brand-identity', cat: 'branding', name: 'Brand Identity Package', price: 450, unit: 'package', startingAt: true, desc: 'Logo, color palette, fonts, and brand guidelines in one package.', icon: '🎨' },
    { id: 'brand-letterhead', cat: 'branding', name: 'Letterheads', price: 75, unit: 'design', startingAt: true, desc: 'Custom letterhead design and printing for official documents.', icon: '📄' },
    { id: 'brand-envelopes', cat: 'branding', name: 'Envelopes', price: 85, unit: 'design', startingAt: true, desc: 'Branded envelope design and printing.', icon: '✉️' },
    { id: 'brand-social', cat: 'branding', name: 'Social Media Branding Kit', price: 199, unit: 'kit', startingAt: true, desc: 'Profile images, cover photos, and post templates matched to your brand.', icon: '📱' },
    { id: 'brand-fbig', cat: 'branding', name: 'Facebook & Instagram Business Setup', price: 150, unit: 'setup', startingAt: true, desc: 'Get your business pages set up and ready to post.', icon: '📱' },

    // Packages
    { id: 'package-starter', cat: 'packages', name: 'Complete Business Starter Package', price: 1499, unit: 'package', startingAt: true, featured: true, desc: 'Custom logo, professional website (up to 5 pages), business cards, social media setup, Google Business Profile, yard sign or banner, and basic brand guidelines.', icon: '🚀' },
  ];

  const CATEGORY_LABEL = {
    dtf: 'DTF Gang Sheets',
    signs: 'Signs & Banners',
    vinyl: 'Vinyl Lettering',
    vehicle: 'Vehicle Graphics',
    tint: 'Window Tint',
    printing: 'Printing Services',
    apparel: 'Custom Apparel',
    design: 'Graphic Design',
    web: 'Website Creation',
    branding: 'Business Branding',
    packages: 'Packages',
  };

  const CATEGORY_ACCENT = {
    dtf: '#ffa728',
    signs: '#2ba4ff',
    vinyl: '#6bc1ff',
    vehicle: '#ff7a00',
    tint: '#8b7cf6',
    printing: '#ffa728',
    apparel: '#e8394a',
    design: '#2ba4ff',
    web: '#22c1a0',
    branding: '#8b7cf6',
    packages: '#ffa728',
  };

  const shopGrid = document.getElementById('shopGrid');
  const filterButtons = document.querySelectorAll('.shop-filter');
  const cartTray = document.getElementById('cartTray');
  const cartToggle = document.getElementById('cartToggle');
  const cartPanel = document.getElementById('cartPanel');
  const cartItemsEl = document.getElementById('cartItems');
  const cartCountEl = document.getElementById('cartCount');
  const cartTotalEl = document.getElementById('cartTotal');
  const cartTotalsEl = document.getElementById('cartTotals');
  const cartCheckoutBtn = document.getElementById('cartCheckoutBtn');
  const TAX_RATE = 0.07;

  const orderSheet = document.getElementById('orderSheet');
  const orderSheetBackdrop = document.getElementById('orderSheetBackdrop');
  const orderSheetClose = document.getElementById('orderSheetClose');
  const orderSheetItems = document.getElementById('orderSheetItems');
  const orderSheetTotals = document.getElementById('orderSheetTotals');
  const orderSheetForm = document.getElementById('orderSheetForm');
  const orderSheetFeedback = document.getElementById('orderSheetFeedback');

  let cart = {}; // id -> qty

  const tt = (key, fallback) => (window.t ? window.t(key) : fallback);

  function formatPrice(product) {
    if (product.price === null) return tt('shop.freeQuote', 'Free Quote');
    const prefix = product.startingAt ? tt('shop.fromPrefix', 'From ') : '';
    const unit = product.unit ? ` / ${product.unit}` : '';
    return `${prefix}$${product.price}${unit}`;
  }

  function renderProducts(filter) {
    shopGrid.innerHTML = '';
    const list = filter === 'all' ? PRODUCTS : PRODUCTS.filter((p) => p.cat === filter);

    list.forEach((product) => {
      const card = document.createElement('article');
      card.className = 'shop-card' + (product.featured ? ' shop-card--featured' : '');
      card.innerHTML = `
        ${product.featured ? `<span class="shop-card__badge">${tt('pricing.badge', 'Most Popular')}</span>` : ''}
        ${product.image
          ? `<div class="shop-card__media"><img src="${product.image}" alt="${product.name}" loading="lazy"></div>`
          : `<div class="shop-card__media shop-card__media--generic" style="--accent: ${CATEGORY_ACCENT[product.cat] || '#ffa728'}">
              <span class="shop-card__icon-ghost">${product.icon}</span>
              <span class="shop-card__icon-glow"></span>
              <span class="shop-card__icon-lg">${product.icon}</span>
            </div>`}
        <span class="shop-card__cat">${CATEGORY_LABEL[product.cat]}</span>
        <h3>${product.name}</h3>
        <p>${product.desc}</p>
        <span class="shop-card__price">${formatPrice(product)}</span>
        <div class="shop-card__actions">
          <button class="btn btn-small shop-add-btn" data-id="${product.id}">${tt('shop.addToCart', 'Add to Cart')}</button>
          ${product.link ? `<a href="${product.link}" class="shop-card__tool-link">${tt('shop.openTool', 'Open design tool →')}</a>` : ''}
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

  function round2(n) {
    return Math.round(n * 100) / 100;
  }

  function computeTotals() {
    let subtotal = 0;
    let hasQuoteItems = false;
    Object.keys(cart).forEach((id) => {
      const product = PRODUCTS.find((p) => p.id === id);
      if (!product) return;
      if (product.price === null) hasQuoteItems = true;
      else subtotal += product.price * cart[id];
    });
    const tax = round2(subtotal * TAX_RATE);
    const total = round2(subtotal + tax);
    return { subtotal: round2(subtotal), tax, total, hasQuoteItems };
  }

  function renderTotals(container, { subtotal, tax, total, hasQuoteItems }) {
    if (subtotal <= 0 && !hasQuoteItems) {
      container.innerHTML = '';
      return;
    }
    container.innerHTML = `
      <div class="cart-totals__row"><span>${tt('shop.subtotal', 'Subtotal')}</span><span>$${subtotal}${hasQuoteItems ? '+' : ''}</span></div>
      <div class="cart-totals__row"><span>${tt('shop.taxLabel', 'Sales Tax (7%)')}</span><span>$${tax}${hasQuoteItems ? '+' : ''}</span></div>
      <div class="cart-totals__row cart-totals__row--total"><span>${tt('shop.totalLabel', 'Total')}</span><span>$${total}${hasQuoteItems ? '+' : ''}</span></div>
      ${hasQuoteItems ? `<p class="cart-totals__note">${tt('shop.quoteNote', 'Tax on quote-based items will be calculated once the final price is confirmed.')}</p>` : ''}
    `;
  }

  function renderCart() {
    const ids = Object.keys(cart);
    const count = ids.reduce((sum, id) => sum + cart[id], 0);
    cartCountEl.textContent = `${count} ${count === 1 ? tt('shop.item', 'item') : tt('shop.items', 'items')}`;

    cartItemsEl.innerHTML = '';

    ids.forEach((id) => {
      const product = PRODUCTS.find((p) => p.id === id);
      if (!product) return;

      const row = document.createElement('div');
      row.className = 'cart-item';
      row.innerHTML = `
        <span class="cart-item__name">${product.name}</span>
        <div class="cart-item__qty">
          <button class="cart-qty-btn" data-id="${id}" data-delta="-1">−</button>
          <span>${cart[id]}</span>
          <button class="cart-qty-btn" data-id="${id}" data-delta="1">+</button>
        </div>
        <span class="cart-item__price">${product.price === null ? tt('shop.freeQuote', 'Free Quote') : '$' + round2(product.price * cart[id])}</span>
      `;
      cartItemsEl.appendChild(row);
    });

    const totals = computeTotals();
    renderTotals(cartTotalsEl, totals);

    cartTotalEl.textContent = count === 0 ? '' : (totals.total > 0 ? `$${totals.total}${totals.hasQuoteItems ? '+' : ''}` : tt('shop.quoteNeeded', 'Quote needed'));

    cartItemsEl.querySelectorAll('.cart-qty-btn').forEach((btn) => {
      btn.addEventListener('click', () => updateQty(btn.dataset.id, Number(btn.dataset.delta)));
    });

    if (count === 0) {
      cartItemsEl.innerHTML = `<p class="cart-empty">${tt('shop.emptyCart', 'Your cart is empty. Add products to request a quote.')}</p>`;
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
    cartTray.classList.toggle('is-open');
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
    renderTotals(orderSheetTotals, computeTotals());
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

    const paidViaZelle = document.getElementById('shopPaidViaZelle').checked;
    const notes = document.getElementById('shopOrderNotes').value;
    const totals = computeTotals();

    const totalsNote = `Subtotal: $${totals.subtotal}${totals.hasQuoteItems ? '+' : ''} | Sales Tax (7%): $${totals.tax}${totals.hasQuoteItems ? '+' : ''} | Total: $${totals.total}${totals.hasQuoteItems ? '+' : ''}${totals.hasQuoteItems ? ' (tax on quote items calculated once final price is set)' : ''}`;

    const payload = {
      name: document.getElementById('shopCustomerName').value,
      email: document.getElementById('shopCustomerEmail').value,
      phone: document.getElementById('shopCustomerPhone').value,
      category: 'shop-cart',
      items,
      subtotal: totals.subtotal,
      tax: totals.tax,
      total: totals.total,
      taxRate: TAX_RATE,
      notes: [paidViaZelle ? '[Customer marked: already sent payment via Zelle]' : '', totalsNote, notes].filter(Boolean).join('\n'),
      honeypot: document.getElementById('orderSheetHoneypot')?.value || '',
    };

    orderSheetFeedback.textContent = tt('shop.sending', 'Sending your order request…');
    orderSheetFeedback.classList.remove('hidden');

    try {
      const res = await fetch(ORDERS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Request failed');
      orderSheetFeedback.textContent = tt('shop.orderSuccess', "Thanks! We've got your order request and will follow up shortly.");
      cart = {};
      renderCart();
      orderSheetForm.reset();
    } catch (err) {
      orderSheetFeedback.textContent = tt('shop.orderError', 'Something went wrong sending your request — please call or text us at 336-215-0518 instead.');
    }
  });

  document.addEventListener('asignsLangChange', () => {
    const activeFilter = document.querySelector('.shop-filter.is-active');
    renderProducts(activeFilter ? activeFilter.dataset.filter : 'all');
    renderCart();
  });

  renderProducts('all');
  renderCart();
});
