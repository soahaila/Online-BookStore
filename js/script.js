// ================= GLOBAL VARIABLES =================
let cart = JSON.parse(localStorage.getItem('bookverse_cart')) || [];

// ================= DOM ELEMENTS =================
const navLinks = document.getElementById('navLinks');
const hamburger = document.getElementById('hamburger');
const themeToggle = document.getElementById('themeToggle');
const cartBtn = document.getElementById('cartBtn');
const closeCartBtn = document.getElementById('closeCartBtn');
const cartSidebar = document.getElementById('cartSidebar');
const cartOverlay = document.getElementById('cartOverlay');
const cartItemsContainer = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const cartTotalPrice = document.getElementById('cartTotalPrice');

// Modal Elements
const modal = document.getElementById('bookModal');
const closeModal = document.querySelector('.close-modal');
const modalTitle = document.getElementById('modalTitle');
const modalAuthor = document.getElementById('modalAuthor');
const modalDesc = document.getElementById('modalDesc');
const modalPrice = document.getElementById('modalPrice');
const modalImg = document.getElementById('modalImg');
const modalAddBtn = document.getElementById('modalAddBtn');
let currentModalBook = null; // Tracks book currently in modal

// ================= FEATURE 1: MOBILE HAMBURGER MENU =================
hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

// Close menu when a link is clicked
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
    });
});

// ================= FEATURE 2: DARK/LIGHT MODE TOGGLE =================
const currentTheme = localStorage.getItem('theme');
if (currentTheme === 'dark') {
    document.body.setAttribute('data-theme', 'dark');
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
}

themeToggle.addEventListener('click', () => {
    if (document.body.getAttribute('data-theme') === 'dark') {
        document.body.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    } else {
        document.body.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
});

// ================= FEATURE 3: SHOPPING CART SIDEBAR (Left Slide) =================
// Open Cart
cartBtn.addEventListener('click', () => {
    cartSidebar.classList.add('active');
    cartOverlay.classList.add('active');
});

// Close Cart
const closeCart = () => {
    cartSidebar.classList.remove('active');
    cartOverlay.classList.remove('active');
};
closeCartBtn.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

// ================= FEATURE 4: CART LOGIC (Local Storage) =================
// Initialize Cart UI on page load
updateCartUI();

// Add to Cart buttons
document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const title = btn.getAttribute('data-title');
        const price = parseFloat(btn.getAttribute('data-price'));
        
        addToCart(id, title, price);
        
        // Automatically open cart to show feedback
        cartSidebar.classList.add('active');
        cartOverlay.classList.add('active');
    });
});

function addToCart(id, title, price) {
    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id, title, price, quantity: 1 });
    }

    saveCart();
    updateCartUI();
}

function updateCartUI() {
    cartItemsContainer.innerHTML = '';
    let total = 0;
    let count = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Your cart is empty.</p>';
    } else {
        cart.forEach(item => {
            total += item.price * item.quantity;
            count += item.quantity;

            const itemEl = document.createElement('div');
            itemEl.classList.add('cart-item');
            itemEl.innerHTML = `
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.title}</div>
                    <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
                </div>
                <div class="cart-item-controls">
                    <button class="qty-btn minus" onclick="changeQuantity('${item.id}', -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn plus" onclick="changeQuantity('${item.id}', 1)">+</button>
                    <button class="remove-btn" onclick="removeFromCart('${item.id}')"><i class="fas fa-trash"></i></button>
                </div>
            `;
            cartItemsContainer.appendChild(itemEl);
        });
    }

    cartCount.innerText = count;
    cartTotalPrice.innerText = `$${total.toFixed(2)}`;
}

// Functions exposed to window for inline onclick handlers in cart items
window.changeQuantity = function(id, change) {
    const item = cart.find(item => item.id === id);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(id);
        } else {
            saveCart();
            updateCartUI();
        }
    }
};

window.removeFromCart = function(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    updateCartUI();
};

function saveCart() {
    localStorage.setItem('bookverse_cart', JSON.stringify(cart));
}

// ================= FEATURE 5: MODAL POPUP =================
document.querySelectorAll('.view-details').forEach(btn => {
    btn.addEventListener('click', () => {
        currentModalBook = {
            id: btn.getAttribute('data-id') || Math.random().toString(), // Fallback if id missing
            title: btn.getAttribute('data-title'),
            author: btn.getAttribute('data-author'),
            desc: btn.getAttribute('data-desc'),
            price: parseFloat(btn.getAttribute('data-price')),
            img: btn.getAttribute('data-img')
        };

        // Populate modal
        modalTitle.innerText = currentModalBook.title;
        modalAuthor.innerHTML = `<strong>Author:</strong> ${currentModalBook.author}`;
        modalDesc.innerText = currentModalBook.desc;
        modalPrice.innerText = `$${currentModalBook.price.toFixed(2)}`;
        modalImg.src = currentModalBook.img;
        modalImg.alt = `${currentModalBook.title} Cover`;

        modal.classList.add('active');
    });
});

// Close Modal
closeModal.addEventListener('click', () => modal.classList.remove('active'));
window.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
});

// Add to cart from Modal
modalAddBtn.addEventListener('click', () => {
    if (currentModalBook) {
        // Find real ID from the grid if it exists, else use generated
        addToCart(currentModalBook.id, currentModalBook.title, currentModalBook.price);
        modal.classList.remove('active');
        cartSidebar.classList.add('active');
        cartOverlay.classList.add('active');
    }
});

// ================= FEATURE 6: FORM VALIDATION =================
const contactForm = document.getElementById('contactForm');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const messageInput = document.getElementById('message');
const successMsg = document.getElementById('successMsg');

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;

    // Reset error states
    document.querySelectorAll('.error-msg').forEach(msg => msg.style.display = 'none');
    document.querySelectorAll('input, textarea').forEach(el => el.style.borderColor = 'var(--border-color)');
    successMsg.style.display = 'none';

    // Validate Name
    if (nameInput.value.trim() === '') {
        document.getElementById('nameError').style.display = 'block';
        nameInput.style.borderColor = '#ef4444';
        isValid = false;
    }

    // Validate Email (Regex)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput.value.trim())) {
        document.getElementById('emailError').style.display = 'block';
        emailInput.style.borderColor = '#ef4444';
        isValid = false;
    }

    // Validate Message
    if (messageInput.value.trim() === '') {
        document.getElementById('messageError').style.display = 'block';
        messageInput.style.borderColor = '#ef4444';
        isValid = false;
    }

    // If valid
    if (isValid) {
        successMsg.style.display = 'block';
        contactForm.reset();
        setTimeout(() => { successMsg.style.display = 'none'; }, 3000);
    }
});