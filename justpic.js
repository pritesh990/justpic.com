
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
  // Remove from cart
  document.querySelectorAll('.cart-remove').forEach(button => {
    button.addEventListener('click', removeCartItem);
  });

  // Quantity change
  document.querySelectorAll('.cart-quantity').forEach(input => {
    input.addEventListener('change', quantityChanged);
  });

  // Add to cart
  document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', addCartClicked);
  });

  // Buy now
  document.querySelector('.btn-buy').addEventListener('click', sendOrderToWhatsApp);
}

function removeCartItem(event) {
  event.target.closest('.cart-box').remove();
  updateTotal();
}

function quantityChanged(event) {
  let input = event.target;
  if (isNaN(input.value) || input.value <= 0) {
    input.value = 1;
  }
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
      <input type="number" value="1" class="cart-quantity">
    </div>
    <i class="fa-solid fa-trash cart-remove"></i>
  `;

  cartItems.append(cartBox);

  cartBox.querySelector('.cart-remove').addEventListener('click', removeCartItem);
  cartBox.querySelector('.cart-quantity').addEventListener('change', quantityChanged);
}

function updateTotal() {
  let cartBoxes = document.querySelectorAll(".cart-box");
  let total = 0;

  cartBoxes.forEach((box) => {
    let priceText = box.querySelector(".cart-price").innerText;
    let match = priceText.match(/₹(\d+)/);
    if (match) {
      let price = parseFloat(match[1]);
      let quantity = parseInt(box.querySelector(".cart-quantity").value);
      total += price * quantity;
    }
  });

  total = Math.round(total * 100) / 100;
  document.querySelector(".total-price").innerText = "₹" + total.toFixed(2);
}

function sendOrderToWhatsApp() {
  let cartBoxes = document.querySelectorAll('.cart-box');
  if (cartBoxes.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  let message = "🛒 *New Order*\n\n";
  cartBoxes.forEach(box => {
    let title = box.querySelector('.cart-product-title').innerText;
    let price = box.querySelector('.cart-price').innerText;
    let quantity = box.querySelector('.cart-quantity').value;
    message += `• ${title} - ${price} x ${quantity}\n`;
  });

  let totalText = document.querySelector('.total-price').innerText;
  let total = parseFloat(totalText.replace("₹", ""));
  message += `\n📦 *Total: ₹${total.toFixed(2)}*`;

  if (total <= 99) {
    message += `\n🚚 Delivery Charge:  (₹99 સુધી ના Order પર delivery ચાર્જ ₹20)`;
  } else {
    message += `\n🚚 Delivery Charge:  (₹100 થી ઉપર ના Order પર delivery ચાર્જ free)`;
  }

  // WhatsApp Business number (without + or dashes)
  let phoneNumber = "917041439086"; // Replace with your number

  // Encode and open WhatsApp
  let url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
}

let cartCount = 0;
const addToCartButtons = document.querySelectorAll('.btn');
const cartCountElement = document.getElementById('cart-count');

addToCartButtons.forEach(button => {
  button.addEventListener('click', () => {
    cartCount++;
    cartCountElement.textContent = cartCount;
  });
});

