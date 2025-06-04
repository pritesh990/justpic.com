let cartIcon = document.querySelector(".icon");
let cart = document.querySelector(".cart");
let closeCart = document.querySelector("#close-cart");

// Open cart
cartIcon.addEventListener('click', () => {
  cart.classList.toggle('active');
});

// Close cart
closeCart.addEventListener('click', () => {
  cart.classList.remove('active');
});

// Ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', ready);
} else {
  ready();
}

function ready() {
  document.querySelectorAll('.cart-remove').forEach(button => {
    button.addEventListener('click', removeCartItem);
  });

  document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', addCartClicked);
  });

  document.querySelector('.btn-buy').addEventListener('click', () => {
    document.getElementById("orderForm").classList.add("active");
  });
}

function removeCartItem(event) {
  event.target.closest('.cart-box').remove();
  updateTotal();
}

function addCartClicked(event) {
  let shopProduct = event.target.closest('.food-img');
  let title = shopProduct.querySelector('h1').innerText;
  let price = shopProduct.querySelector('h3').innerText;
  let productImg = shopProduct.querySelector('img').src;
  addProductToCart(title, price, productImg);
  updateTotal();
}

function addProductToCart(title, price, productImg) {
  let cartItems = document.querySelector('.cart-content');
  let cartItemNames = cartItems.querySelectorAll('.cart-product-title');

  for (let name of cartItemNames) {
    if (name.innerText === title) {
      alert("You have already added this item to the cart");
      return;
    }
  }

  let cartBox = document.createElement('div');
  cartBox.classList.add('cart-box');
  cartBox.innerHTML = `
    <img src="${productImg}" class="cart-img">
    <div class="detail-box">
      <div class="cart-product-title">${title}</div>
      <div class="cart-price">${price}</div>
      <div class="quantity-controls">
        <button class="qty-btn minus">-</button>
        <span class="qty-value">1</span>
        <button class="qty-btn plus">+</button>
      </div>
    </div>
    <i class="fa-solid fa-trash cart-remove"></i>
  `;

  cartItems.append(cartBox);

  cartBox.querySelector('.cart-remove').addEventListener('click', removeCartItem);
  setupQuantityButtons(cartBox); // ✅ THIS WAS MISSING
  updateTotal();
}

function setupQuantityButtons(cartBox) {
  const minusBtn = cartBox.querySelector('.minus');
  const plusBtn = cartBox.querySelector('.plus');
  const qtyValue = cartBox.querySelector('.qty-value');

  minusBtn.addEventListener('click', () => {
    let currentQty = parseInt(qtyValue.textContent);
    if (currentQty > 1) {
      qtyValue.textContent = currentQty - 1;
      updateTotal();
    }
  });

  plusBtn.addEventListener('click', () => {
    let currentQty = parseInt(qtyValue.textContent);
    if (currentQty < 10) {
      qtyValue.textContent = currentQty + 1;
      updateTotal();
    }
  });
}

function updateTotal() {
  let cartBoxes = document.querySelectorAll(".cart-box");
  let total = 0;

  cartBoxes.forEach((box) => {
    let priceText = box.querySelector(".cart-price").innerText;
    let match = priceText.match(/₹(\d+)/);
    if (match) {
      let price = parseFloat(match[1]);
      let quantity = parseInt(box.querySelector(".qty-value").textContent);
      total += price * quantity;
    }
  });

  total = Math.round(total * 100) / 100;
  document.querySelector(".total-price").innerText = "₹" + total.toFixed(2);
}

// Close form on Cancel click
document.getElementById("closeForm").addEventListener("click", () => {
  document.getElementById("orderForm").classList.remove("active");
});

// Cart count badge
let cartCount = 0;
const addToCartButtons = document.querySelectorAll('.btn');
const cartCountElement = document.getElementById('cart-count');

addToCartButtons.forEach(button => {
  button.addEventListener('click', () => {
    cartCount++;
    cartCountElement.textContent = cartCount;
  });
});

// Form submit and send to WhatsApp
document.getElementById("checkoutForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const name = this.querySelector('input[placeholder="Full Name"]').value.trim();
  const phone = this.querySelector('input[placeholder="Phone Number"]').value.trim();
  const address = this.querySelector('textarea[placeholder="Address"]').value.trim();
  const cartItems = document.querySelectorAll(".cart-box");

  if (cartItems.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  let message = `🛒 *New Order Received on https://justpic-com-sable.vercel.app/*%0A%0A`;
  message += `👤 *Name:* ${name}%0A📞 *Phone:* ${phone}%0A🏠 *Address:* ${address}%0A%0A`;
  message += `🧾 *Order Details:*%0A`;

  let totalAmount = 0;

  cartItems.forEach((box, index) => {
    const title = box.querySelector(".cart-product-title").innerText;
    const priceText = box.querySelector(".cart-price").innerText;
    const match = priceText.match(/₹(\d+)/);
    const price = match ? parseFloat(match[1]) : 0;
    const quantity = parseInt(box.querySelector(".qty-value").textContent);

    const itemTotal = price * quantity;
    totalAmount += itemTotal;

    message += `${index + 1}. ${title} - ₹${price} × ${quantity} = ₹${itemTotal}%0A`;
  });

  message += `\n📦 *Total Amount:* ₹${totalAmount.toFixed(2)}%0A%0A`;

  if (totalAmount <= 99) {
    message += `🚚 *Delivery Charge:* (₹99 સુધી ના Order પર delivery ચાર્જ ₹20)%0A`;
  } else {
    message += `🚚 *Delivery Charge:* (₹100 ઉપર ના Order પર delivery ચાર્જ Free)%0A`;
  }

  message += `%0A📞 *Customer Care Number:* 7041439086 %0A`;
  message += `🕔 *Note:* ડિલિવરી સાંજે 5:00 થી 7:00 વાગ્ય સુધી પોહચાડી દેવમાં આવશે.%0A`;

  // Get location
  getUserLocation((locationLink) => {
  message += `%0A📍 *Location:* ${locationLink}`;
  
  // ✅ Save to localStorage
  const orders = JSON.parse(localStorage.getItem("justpic_orders")) || [];
  orders.push(message.replace(/%0A/g, "\n"));
  localStorage.setItem("justpic_orders", JSON.stringify(orders));

  const whatsappURL = `https://wa.me/917041439086?text=${message}`;
  window.open(whatsappURL, "_blank");
  document.getElementById("orderForm").classList.remove("active");
});


  function getUserLocation(callback) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          callback(`https://www.google.com/maps?q=${lat},${lon}`);
        },
        () => callback("Location access denied")
      );
    } else {
      callback("Geolocation not supported");
    }
  }
});

// Save to localStorage for display
const orders = JSON.parse(localStorage.getItem("justpic_orders")) || [];
orders.push(message.replace(/%0A/g, "\n"));
localStorage.setItem("justpic_orders", JSON.stringify(orders));



