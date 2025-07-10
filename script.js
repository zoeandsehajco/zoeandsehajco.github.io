document.addEventListener('DOMContentLoaded', function () {
  const fixedSizePrice = 6.00;  // price per bracelet
  const baseShippingFee = 4.00; // base shipping fee
  let bannerShown = false;

  if (!localStorage.getItem('cart')) {
    localStorage.setItem('cart', JSON.stringify([]));
  }

  function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
  }

  function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
  }

  function updateCartCount() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);
    const cartCountEl = document.getElementById('cart-count');
    if (cartCountEl) cartCountEl.textContent = totalItems;
  }

  function showNotification(message = 'Added to cart!') {
    let notification = document.getElementById('cart-notification');
    if (!notification) {
      notification = document.createElement('div');
      notification.id = 'cart-notification';
      Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        backgroundColor: '#28a745',
        color: 'white',
        padding: '12px 20px',
        borderRadius: '5px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        zIndex: '1000',
        fontSize: '16px',
        display: 'none',
      });
      document.body.appendChild(notification);
    }

    notification.textContent = message;
    notification.style.display = 'block';

    clearTimeout(notification.hideTimeout);
    notification.hideTimeout = setTimeout(() => {
      notification.style.display = 'none';
    }, 2000);
  }

  function calculateShipping(cart) {
    const totalQuantity = cart.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);
    return totalQuantity >= 3 ? 0 : baseShippingFee;
  }

  function updateFreeShippingBanner() {
    let banner = document.getElementById('free-shipping-banner');

    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'free-shipping-banner';
      banner.textContent = '🎉 Free Shipping Unlocked!';
      Object.assign(banner.style, {
        backgroundColor: '#28a745',
        color: 'white',
        padding: '12px',
        textAlign: 'center',
        fontSize: '16px',
        fontWeight: 'bold',
        display: 'none',
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        zIndex: '9999',
      });
      document.body.appendChild(banner);
    }

    const cart = getCart();
    const totalQuantity = cart.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);

    if (totalQuantity === 3 && !bannerShown) {
      banner.style.display = 'block';
      bannerShown = true;

      setTimeout(() => {
        banner.style.display = 'none';
      }, 2000);
    }

    if (totalQuantity < 3) {
      bannerShown = false; // reset for next time
    }
  }

  function updateCartUI() {
    const cart = getCart();
    const cartItemsContainer = document.getElementById('cart-items');
    const totalPriceElement = document.getElementById('total-price');

    if (!cartItemsContainer || !totalPriceElement) return;

    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
      totalPriceElement.textContent = 'Total: $0.00';
      updateCartCount();
      updateFreeShippingBanner();
      return;
    }

    let subtotal = 0;

    cart.forEach(item => {
      const imageSrc = item.image || 'default-image.jpg';
      const name = item.name || 'Unnamed product';
      const quantity = parseInt(item.quantity) || 1;
      const id = item.id || '';
      const size = item.size || '';

      const price = fixedSizePrice;
      subtotal += price * quantity;

      const itemEl = document.createElement('div');
      itemEl.classList.add('cart-item');
      itemEl.style.display = 'flex';
      itemEl.style.alignItems = 'center';
      itemEl.style.gap = '15px';
      itemEl.style.marginBottom = '15px';

      itemEl.innerHTML = `
        <img src="${imageSrc}" alt="${name}" style="width:80px; height:80px; object-fit:cover; border-radius:8px;">
        <div style="flex-grow:1;">
          <h3 style="margin:0 0 6px;">${name}</h3>
          <label for="size-${id}">Size:</label>
          <select class="cart-size" id="size-${id}" data-id="${id}" style="margin-left: 6px; margin-bottom: 8px;">
            <option value=""${size === '' ? ' selected' : ''}>Select Size</option>
            <option value="XS"${size === 'XS' ? ' selected' : ''}>XS: 5+</option>
            <option value="S"${size === 'S' ? ' selected' : ''}>S: 8+</option>
            <option value="M"${size === 'M' ? ' selected' : ''}>M: 12+ (most recommended for teens and adults)</option>
            <option value="L"${size === 'L' ? ' selected' : ''}>L: 14+ (most recommended for teens and adults)</option>
            <option value="XL"${size === 'XL' ? ' selected' : ''}>XL</option>
          </select>
          <p style="margin:0 0 6px;">Price: $${(price * quantity).toFixed(2)}</p>
          <label for="qty-${id}">Quantity:</label>
          <input
            type="number"
            class="quantity"
            id="qty-${id}"
            data-id="${id}"
            value="${quantity}"
            min="1"
            style="width: 60px; margin-left: 10px;">
        </div>
        <button class="remove-item" data-id="${id}" aria-label="Remove ${name} from cart"
          style="background-color:#dc1e83; color:white; border:none; padding:8px 12px; border-radius:6px; cursor:pointer;">
          Remove
        </button>
      `;

      cartItemsContainer.appendChild(itemEl);
    });

    const shippingFee = calculateShipping(cart);
    const total = subtotal + shippingFee;

    totalPriceElement.innerHTML = `
      <p>Subtotal: $${subtotal.toFixed(2)}</p>
      <p>Shipping Fee: ${shippingFee === 0 ? 'Free' : `$${shippingFee.toFixed(2)}`}</p>
      <p><strong>Total: $${total.toFixed(2)}</strong></p>
    `;

    updateCartCount();
    updateFreeShippingBanner();
  }

  function addToCart(product) {
    if (!product.id) {
      alert('Product ID missing!');
      return;
    }

    const cart = getCart();
    const existing = cart.find(item => item.id === product.id);

    if (existing) {
      existing.quantity = (parseInt(existing.quantity) || 0) + 1;
    } else {
      cart.push({ ...product, quantity: 1, size: '', sizePrice: fixedSizePrice });
    }

    saveCart(cart);
    updateCartCount();
    showNotification(`${product.name} added to cart!`);

    if (document.getElementById('cart-items')) {
      updateCartUI();
    }
  }

  function setupAddToCartButtons() {
    const buttons = document.querySelectorAll('.add-to-cart, #addToCart');

    buttons.forEach(button => {
      button.addEventListener('click', function () {
        let product;

        if (this.id === 'addToCart') {
          const name = document.getElementById('productName')?.textContent || 'Unnamed product';
          const productId = name.toLowerCase().replace(/\s+/g, '-');
          const image = document.getElementById('mainImage')?.src || 'default-image.jpg';

          product = { id: productId, name, image };
        } else {
          const productBox = this.closest('.product-box');
          if (!productBox) return;

          const productId = productBox.dataset.id || productBox.querySelector('h3')?.textContent.toLowerCase().replace(/\s+/g, '-') || '';
          const name = productBox.querySelector('h3')?.textContent || 'Unnamed product';
          const image = productBox.querySelector('img')?.src || 'default-image.jpg';

          product = { id: productId, name, image };
        }

        addToCart(product);
      });
    });
  }

  function removeFromCart(id) {
    if (!id) return;

    let cart = getCart();

    if (confirm('Are you sure you want to remove this item from your cart?')) {
      cart = cart.filter(item => item.id !== id);
      saveCart(cart);
      updateCartUI();
    }
  }

  function changeQuantity(id, newQty) {
    if (!id) return;

    if (isNaN(newQty) || newQty < 1) {
      alert('Quantity must be at least 1.');
      newQty = 1;
    }

    const cart = getCart();
    const item = cart.find(i => i.id === id);
    if (item) {
      item.quantity = newQty;
      saveCart(cart);
      updateCartUI();
    }
  }

  function changeSize(id, newSize) {
    if (!id) return;

    const cart = getCart();
    const item = cart.find(i => i.id === id);
    if (item) {
      item.size = newSize;
      item.sizePrice = fixedSizePrice;
      saveCart(cart);
      updateCartUI();
    }
  }

  document.addEventListener('click', function (e) {
    if (e.target.classList.contains('remove-item')) {
      const id = e.target.getAttribute('data-id');
      removeFromCart(id);
    }
  });

  document.addEventListener('change', function (e) {
    if (e.target.classList.contains('quantity')) {
      const id = e.target.getAttribute('data-id');
      const newQty = parseInt(e.target.value);
      changeQuantity(id, newQty);
    } else if (e.target.classList.contains('cart-size')) {
      const id = e.target.getAttribute('data-id');
      const newSize = e.target.value;
      changeSize(id, newSize);
    }
  });

  const checkoutBtn = document.getElementById('checkout-link');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', function (e) {
      e.preventDefault();

      const cart = getCart();

      if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
      }

      const missingSizeItems = cart.filter(item => !item.size || item.size.trim() === '');
      if (missingSizeItems.length > 0) {
        alert('Please select a size for all items before proceeding to checkout.');
        return;
      }

      const subtotal = cart.reduce((sum, item) => sum + (fixedSizePrice * item.quantity), 0);
      const shippingFee = calculateShipping(cart);
      const total = subtotal + shippingFee;

      let emailBody = `Information:%0A%0A`;
      emailBody += `1. Full Name:%0A`;
      emailBody += `2. Shipping Address (State, City, Zip-code, Address):%0A`;
      emailBody += `3. Payment Method (Venmo or CashApp):%0A`;
      emailBody += `4. Payment Account Username:%0A%0A`;

      emailBody += `Order Summary:%0A`;
      cart.forEach(item => {
        emailBody += `• ${item.name} (${item.size}) x${item.quantity} - $${(fixedSizePrice * item.quantity).toFixed(2)}%0A`;
      });

      emailBody += `%0ASubtotal: $${subtotal.toFixed(2)}%0A`;
      emailBody += `Shipping Fee: ${shippingFee === 0 ? 'Free' : `$${shippingFee.toFixed(2)}`}%0A`;
      emailBody += `Total: $${total.toFixed(2)}%0A%0A`;
      emailBody += `Please pay the total price through Venmo or CashApp.%0AThank you!`;

      const subject = encodeURIComponent('Checkout Order');
      const recipient = 'zoeandsehajco@gmail.com';

      const isMobile = /Mobi|Android/i.test(navigator.userAgent);
      const mailtoLink = `mailto:${recipient}?subject=${subject}&body=${emailBody}`;
      const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${recipient}&su=${subject}&body=${emailBody}&tf=1`;

      if (isMobile) {
        window.location.href = mailtoLink;
      } else {
        window.open(gmailLink, '_blank');
      }
    });
  }

  updateCartCount();
  updateFreeShippingBanner();

  if (document.getElementById('cart-items')) {
    updateCartUI();
  }

  setupAddToCartButtons();
});
