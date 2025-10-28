# 🛒 Frontend Checkout Integration

## Updated Checkout Function
**Replace `placeOrder()` function in `checkout.html`:**

```javascript
async function placeOrder() {
  const cart = getCart();

  const name = document.getElementById("fullName").value;
  const address = document.getElementById("address").value;
  const city = document.getElementById("city").value;
  const pincode = document.getElementById("pincode").value;
  const phone = document.getElementById("phone").value;
  const payment = document.querySelector("input[name='payment']:checked").value;

  if (!name || !address || !city || !pincode || !phone) {
    alert("Please fill all address fields!");
    return;
  }

  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  // Show loading state
  const btn = document.querySelector('.place-order-btn');
  const originalText = btn.innerHTML;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
  btn.disabled = true;

  const orderData = {
    orderItems: cart.map(item => ({
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image
    })),
    shippingAddress: { name, address, city, pincode, phone },
    paymentMethod: payment,
    itemsPrice: cart.reduce((sum, i) => sum + i.price * i.quantity, 0),
    shippingPrice: 0,
    taxPrice: 0,
    totalPrice: cart.reduce((sum, i) => sum + i.price * i.quantity, 0)
  };

  try {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to place an order');
      window.location.href = 'login.html';
      return;
    }

    if (payment === 'COD') {
      // Handle Cash on Delivery
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        const order = await response.json();
        localStorage.setItem("lastOrder", JSON.stringify(order));
        localStorage.removeItem(CART_KEY);
        window.location.href = "orderSuccess.html";
      } else {
        throw new Error('Failed to create order');
      }
    } else {
      // Handle Online Payment with Stripe
      const response = await fetch('http://localhost:5000/api/payment/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        const { url } = await response.json();
        // Store cart data temporarily for after payment
        localStorage.setItem('pendingOrder', JSON.stringify(orderData));
        // Redirect to Stripe checkout
        window.location.href = url;
      } else {
        throw new Error('Failed to create payment session');
      }
    }
  } catch (error) {
    console.error('Order placement error:', error);
    alert('Failed to place order. Please try again.');
  } finally {
    // Reset button state
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
}
```

## Order Success Page Enhancement
**Add to `orderSuccess.html` script section:**

```javascript
// Handle Stripe success redirect
const urlParams = new URLSearchParams(window.location.search);
const sessionId = urlParams.get('session_id');

if (sessionId) {
  // Clear pending order and cart
  localStorage.removeItem('pendingOrder');
  localStorage.removeItem('cart_v1');
  
  // Show success message
  document.querySelector('.success-message').innerHTML = `
    <h2>Payment Successful!</h2>
    <p>Your order has been confirmed and will be processed shortly.</p>
    <p>Session ID: ${sessionId}</p>
  `;
}
```