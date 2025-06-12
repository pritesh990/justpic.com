let cartIcon = document.querySelector(".icon");
let cart = document.querySelector(".cart");
let closeCart = document.querySelector("#close-cart");
let cartCount = 0;
const cartCountElement = document.getElementById("cart-count");

// Open/Close Cart
cartIcon.addEventListener("click", () => cart.classList.toggle("active"));
closeCart.addEventListener("click", () => cart.classList.remove("active"));

// DOM Ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", ready);
} else {
  ready();
}

function ready() {
  document.querySelectorAll(".cart-remove").forEach(button =>
    button.addEventListener("click", removeCartItem)
  );

  document.querySelectorAll(".btn").forEach(button => {
    button.addEventListener("click", function (event) {
      addCartClicked(event);
      this.classList.add("added");
      this.innerText = "Added";
      this.disabled = true;
    });
  });

  document.querySelector(".btn-buy").addEventListener("click", (e) => {
    e.preventDefault();
    cart.classList.remove("active");
    document.getElementById("orderForm").classList.add("active");
  });
}

// Add to Cart from homepage
function addCartClicked(event) {
  let shopProduct = event.target.closest(".food-img");
  let title = shopProduct.querySelector("h1").innerText;
  let price = shopProduct.querySelector("h3").childNodes[0].textContent.trim().split(" ")[0];
  let productImg = shopProduct.querySelector("img").src;

  addProductToCart(title, price, productImg);
  updateTotal();
  cartCount++;
  cartCountElement.textContent = cartCount;
}

// Add item HTML to cart
function addProductToCart(title, price, productImg) {
  let cartItems = document.querySelector(".cart-content");
  let cartItemNames = cartItems.querySelectorAll(".cart-product-title");

  for (let name of cartItemNames) {
    if (name.innerText === title) {
      alert("You have already added this item to the cart");
      return;
    }
  }

  let cartBox = document.createElement("div");
  cartBox.classList.add("cart-box");
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

  cartBox.querySelector(".cart-remove").addEventListener("click", removeCartItem);
  setupQuantityButtons(cartBox);
  updateTotal();
}

// Setup quantity +/- buttons
function setupQuantityButtons(cartBox) {
  const minusBtn = cartBox.querySelector(".minus");
  const plusBtn = cartBox.querySelector(".plus");
  const qtyValue = cartBox.querySelector(".qty-value");

  minusBtn.addEventListener("click", () => {
    let currentQty = parseInt(qtyValue.textContent);
    if (currentQty > 1) {
      qtyValue.textContent = currentQty - 1;
      updateTotal();
    }
  });

  plusBtn.addEventListener("click", () => {
    let currentQty = parseInt(qtyValue.textContent);
    if (currentQty < 10) {
      qtyValue.textContent = currentQty + 1;
      updateTotal();
    }
  });
}

// Remove cart item
function removeCartItem(event) {
  const cartBox = event.target.closest(".cart-box");
  const removedTitle = cartBox.querySelector(".cart-product-title").innerText;
  cartBox.remove();
  updateTotal();

  document.querySelectorAll(".food-img").forEach((product) => {
    const title = product.querySelector("h1").innerText;
    if (title === removedTitle) {
      const addBtn = product.querySelector(".btn");
      if (addBtn) {
        addBtn.disabled = false;
        addBtn.innerText = "Add";
        addBtn.classList.remove("added");
      }
    }
  });

  cartCount--;
  cartCountElement.textContent = cartCount;
}

// Update total price
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

// Close order form
document.getElementById("closeForm").addEventListener("click", () => {
  document.getElementById("orderForm").classList.remove("active");
});

// Submit order to WhatsApp
document.getElementById("checkoutForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const name = this.querySelector('input[placeholder="Full Name"]').value.trim();
  const phone = this.querySelector('input[placeholder="Phone Number"]').value.trim();
  const address = this.querySelector('textarea[placeholder="Address"]').value.trim();
  const cartItems = document.querySelectorAll(".cart-box");

  if (!name || !phone || !address) {
    alert("Please fill all the form fields.");
    return;
  }

  if (cartItems.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  let plainMessage = `🛒 *New Order Received on https://justpic-com-sable.vercel.app/*\n\n`;
  plainMessage += `👤 *Name:* ${name}\n📞 *Phone:* ${phone}\n🏠 *Address:* ${address}\n\n`;
  plainMessage += `🧾 *Order Details:*\n`;

  let totalAmount = 0;

  cartItems.forEach((box, index) => {
    const title = box.querySelector(".cart-product-title").innerText;
    const priceText = box.querySelector(".cart-price").innerText;
    const match = priceText.match(/₹(\d+)/);
    const price = match ? parseFloat(match[1]) : 0;
    const quantity = parseInt(box.querySelector(".qty-value").textContent);

    // ✅ Get the weight from the homepage card
    const foodCard = Array.from(document.querySelectorAll(".food-img")).find(card =>
      card.querySelector("h1").innerText === title
    );
    let weight = "";
    if (foodCard) {
      const weightSpan = foodCard.querySelector("h3 span:last-child");
      weight = weightSpan ? weightSpan.innerText.trim() : "";
    }

    const itemTotal = price * quantity;
    totalAmount += itemTotal;

    // ✅ WhatsApp order line format
    plainMessage += `${index + 1}. ${title} - ₹${price} ${weight} × ${quantity} = ₹${itemTotal}\n`;
  });

  if (totalAmount < 70) {
    alert("⚠️ Minimum order amount is ₹70.\n\nઓછા મા ઓછો ઓર્ડર ₹70 હોવો જોઇએ.");
    return;
  }

  plainMessage += `\n📦 *Total Amount:* ₹${totalAmount.toFixed(2)}\n`;

  if (totalAmount <= 99) {
    plainMessage += `🚚 *Delivery Charge:* ₹20 (₹99 સુધી ના ઓર્ડર માટે)\n`;
  } else {
    plainMessage += `🚚 *Delivery Charge:* Free (₹100 ઉપર ઓર્ડર માટે)\n`;
  }

  plainMessage += `\n📞 *Customer Care:* 9054887337\n`;
  plainMessage += `🕔 *Delivery Time:* 9 AM to 11 AM\n`;

  getUserLocation((locationLink) => {
    plainMessage += `\n📍 *Location:* ${locationLink}`;
    const whatsappURL = `https://wa.me/919054887337?text=${encodeURIComponent(plainMessage)}`;
    window.open(whatsappURL, "_blank");

    // Reset UI
    document.querySelector(".cart-content").innerHTML = "";
    document.querySelector(".total-price").innerText = "₹0.00";
    cartCount = 0;
    cartCountElement.textContent = cartCount;
    document.getElementById("orderForm").classList.remove("active");
  });
});

// Get user live location
function getUserLocation(callback) {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        const locationLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
        callback(locationLink);
      },
      (error) => {
        console.error("Location error:", error);
        callback("Location not available");
      }
    );
  } else {
    callback("Geolocation not supported");
  }
}
