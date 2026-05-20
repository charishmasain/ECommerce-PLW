// ==========================================================================
// PRODUCT DATABASE
// ==========================================================================
const products = [
    {
        id: 1,
        name: "Minimalist Wireless Headphones",
        category: "electronics",
        price: 149,
        image: "images/headphones.png",
        description: "Experience premium sound with our noise-isolating wireless headphones. Features an ultra-minimalist matte charcoal frame, 30-hour battery life, and plush memory foam ear cups for ultimate daily comfort."
    },
    {
        id: 2,
        name: "Sleek Modern Desk Lamp",
        category: "electronics",
        price: 89,
        image: "images/lamp.png",
        description: "Elevate your work space with this architectural desk lamp. Engineered with a matte black finish, dimmable LED strip, and flexible body to cast soft, directional light exactly where you need it."
    },
    {
        id: 3,
        name: "Minimalist Smartwatch",
        category: "electronics",
        price: 229,
        image: "images/smartwatch.png",
        description: "Stay connected without the clutter. This ultra-thin smartwatch features a high-resolution dark dial, heart-rate tracking, sleep analytics, and a seamless waterproof silicon band."
    },
    {
        id: 4,
        name: "Linen Oversized Shirt",
        category: "clothing",
        price: 75,
        image: "images/shirt.png",
        description: "Woven from 100% organic French flax linen. This relaxed, oversized shirt features a breathable drape, natural textures, and low-key buttons, making it a versatile layer for any season."
    },
    {
        id: 5,
        name: "Classic Canvas Tote Bag",
        category: "accessories",
        price: 45,
        image: "images/tote.png",
        description: "Constructed from 16oz ultra-durable cotton canvas. Designed with extra long double-stitched straps, a spacious interior compartment, and an inner zipped pocket to organize your daily essentials."
    },
    {
        id: 6,
        name: "Organic Cotton Cap",
        category: "accessories",
        price: 30,
        image: "images/cap.png",
        description: "An unstructured six-panel cap made from brushed organic cotton. Featuring a curved visor, embroidered eyelets, and an adjustable fabric strap with a minimalist metal buckle."
    }
];

// ==========================================================================
// APPLICATION STATE
// ==========================================================================
let cart = JSON.parse(localStorage.getItem('aura_cart')) || [];
let activeCategory = 'all';
let maxPrice = 300;

// ==========================================================================
// DOM ELEMENTS
// ==========================================================================
// Product Grid & Messages
const productsGrid = document.getElementById('products-grid');
const noProductsMsg = document.getElementById('no-products-msg');
const resetFiltersLink = document.getElementById('reset-filters-link');

// Filter UI Elements
const navLinks = document.querySelectorAll('.nav-link');
const sidebarFilterBtns = document.querySelectorAll('.filter-btn');
const priceSlider = document.getElementById('price-range');
const priceMaxValLabel = document.getElementById('price-max-val');
const clearFiltersBtn = document.getElementById('clear-filters');

// Cart Drawer UI Elements
const cartToggle = document.getElementById('cart-toggle');
const cartClose = document.getElementById('cart-close');
const cartDrawer = document.getElementById('cart-drawer');
const cartOverlay = document.getElementById('cart-overlay');
const cartItemsContainer = document.getElementById('cart-items-container');
const cartTotalLabel = document.getElementById('cart-total');
const cartBadge = document.getElementById('cart-badge');
const checkoutBtn = document.getElementById('checkout-btn');

// Product Details Modal UI Elements
const detailsModal = document.getElementById('details-modal');
const modalClose = document.getElementById('modal-close');
const modalProductImg = document.getElementById('modal-product-img');
const modalProductCategory = document.getElementById('modal-product-category');
const modalProductName = document.getElementById('modal-product-name');
const modalProductPrice = document.getElementById('modal-product-price');
const modalProductDescription = document.getElementById('modal-product-description');
const modalAddToCartBtn = document.getElementById('modal-add-to-cart-btn');

// ==========================================================================
// APP INITIALIZATION
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    // Initial renders
    filterAndRenderProducts();
    updateCartUI();
    
    // Set initial values
    priceSlider.value = maxPrice;
    priceMaxValLabel.textContent = `$${maxPrice}`;

    // Attach Event Listeners
    setupEventListeners();
});

// ==========================================================================
// PRODUCT LISTING & FILTER LOGIC
// ==========================================================================

// Filter state controller
function filterAndRenderProducts() {
    // Filter by Category and Max Price
    const filtered = products.filter(product => {
        const categoryMatch = activeCategory === 'all' || product.category === activeCategory;
        const priceMatch = product.price <= maxPrice;
        return categoryMatch && priceMatch;
    });

    renderProductsGrid(filtered);
}

// Render products to grid DOM
function renderProductsGrid(productList) {
    productsGrid.innerHTML = '';
    
    if (productList.length === 0) {
        noProductsMsg.style.display = 'block';
        productsGrid.style.display = 'none';
        return;
    }

    noProductsMsg.style.display = 'none';
    productsGrid.style.display = 'grid';

    productList.forEach(product => {
        const card = document.createElement('article');
        card.classList.add('product-card');
        card.innerHTML = `
            <div class="product-img-wrapper" data-id="${product.id}">
                <img src="${product.image}" alt="${product.name}" class="product-img" loading="lazy">
            </div>
            <div class="product-info">
                <span class="product-category">${product.category}</span>
                <h3 class="product-name" data-id="${product.id}">${product.name}</h3>
                <div class="product-price">$${product.price}</div>
                <button class="add-to-cart-btn" data-id="${product.id}">Add to Cart</button>
            </div>
        `;
        productsGrid.appendChild(card);
    });

    // Attach click events on the newly created elements
    attachProductGridInteractions();
}

// Add event handlers to product card elements
function attachProductGridInteractions() {
    // Product Details click trigger on image wrapper and title
    const clickableElements = document.querySelectorAll('.product-img-wrapper, .product-name');
    clickableElements.forEach(element => {
        element.addEventListener('click', (e) => {
            const productId = parseInt(e.currentTarget.getAttribute('data-id'));
            openProductDetails(productId);
        });
    });

    // Add to Cart buttons
    const addBtns = document.querySelectorAll('.add-to-cart-btn');
    addBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = parseInt(e.currentTarget.getAttribute('data-id'));
            addToCart(productId);
            
            // Brief visual feedback on button
            const originalText = e.currentTarget.textContent;
            e.currentTarget.textContent = 'Added ✓';
            e.currentTarget.style.backgroundColor = '#22c55e'; // Green feedback
            e.currentTarget.style.borderColor = '#22c55e';
            e.currentTarget.style.color = '#ffffff';
            
            setTimeout(() => {
                e.currentTarget.textContent = originalText;
                e.currentTarget.style.backgroundColor = ''; // Restore to default CSS
                e.currentTarget.style.borderColor = '';
                e.currentTarget.style.color = '';
            }, 1000);
        });
    });
}

// Synchronize Category selections between navigation bar and sidebar filters
function updateActiveCategory(categoryName) {
    activeCategory = categoryName;

    // Update Header Navigation Active States
    navLinks.forEach(link => {
        if (link.getAttribute('data-category') === categoryName) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Update Sidebar Filter Active States
    sidebarFilterBtns.forEach(btn => {
        if (btn.getAttribute('data-filter-category') === categoryName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    filterAndRenderProducts();
}

// Reset all filters to defaults
function resetAllFilters() {
    activeCategory = 'all';
    maxPrice = 300;
    
    // Update inputs visually
    priceSlider.value = maxPrice;
    priceMaxValLabel.textContent = `$${maxPrice}`;

    // Update active UI classes
    updateActiveCategory('all');
}

// ==========================================================================
// CART FUNCTIONALITY
// ==========================================================================

// Add product to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingCartItem = cart.find(item => item.product.id === productId);

    if (existingCartItem) {
        existingCartItem.quantity += 1;
    } else {
        cart.push({
            product: product,
            quantity: 1
        });
    }

    saveCartAndRefresh();
    openCartDrawer();
}

// Remove entire product from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.product.id !== productId);
    saveCartAndRefresh();
}

// Update item quantity (+ or -)
function updateQuantity(productId, delta) {
    const cartItem = cart.find(item => item.product.id === productId);
    if (!cartItem) return;

    cartItem.quantity += delta;

    // If quantity is 0 or less, remove item entirely
    if (cartItem.quantity <= 0) {
        removeFromCart(productId);
    } else {
        saveCartAndRefresh();
    }
}

// Save to LocalStorage and sync interface
function saveCartAndRefresh() {
    localStorage.setItem('aura_cart', JSON.stringify(cart));
    updateCartUI();
}

// Calculate and render cart panel contents
function updateCartUI() {
    // 1. Calculate stats
    let totalItems = 0;
    let totalPrice = 0;

    cart.forEach(item => {
        totalItems += item.quantity;
        totalPrice += item.product.price * item.quantity;
    });

    // 2. Update Header Badge
    cartBadge.textContent = totalItems;

    // 3. Render items in drawer
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="cart-empty-message">
                <span class="cart-empty-icon">☉</span>
                <p>Your shopping cart is currently empty.</p>
            </div>
        `;
        checkoutBtn.disabled = true;
        checkoutBtn.style.opacity = 0.5;
        checkoutBtn.style.cursor = 'not-allowed';
    } else {
        checkoutBtn.disabled = false;
        checkoutBtn.style.opacity = 1;
        checkoutBtn.style.cursor = 'pointer';

        cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.classList.add('cart-item');
            itemElement.innerHTML = `
                <div class="cart-item-img-wrapper">
                    <img src="${item.product.image}" alt="${item.product.name}" class="cart-item-img">
                </div>
                <div class="cart-item-info">
                    <h4 class="cart-item-name">${item.product.name}</h4>
                    <div class="cart-item-price">$${item.product.price}</div>
                    <div class="cart-item-actions">
                        <div class="quantity-control">
                            <button class="qty-btn minus-btn" data-id="${item.product.id}">-</button>
                            <span class="qty-val">${item.quantity}</span>
                            <button class="qty-btn plus-btn" data-id="${item.product.id}">+</button>
                        </div>
                        <button class="cart-remove-btn" data-id="${item.product.id}">Remove</button>
                    </div>
                </div>
            `;
            cartItemsContainer.appendChild(itemElement);
        });

        // Attach action handlers for inside cart
        attachCartItemsInteractions();
    }

    // 4. Update Subtotal Label
    cartTotalLabel.textContent = `$${totalPrice.toFixed(2)}`;
}

// Add event handlers to inside-cart actions
function attachCartItemsInteractions() {
    // Quantity increment button
    const plusBtns = document.querySelectorAll('.plus-btn');
    plusBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.currentTarget.getAttribute('data-id'));
            updateQuantity(id, 1);
        });
    });

    // Quantity decrement button
    const minusBtns = document.querySelectorAll('.minus-btn');
    minusBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.currentTarget.getAttribute('data-id'));
            updateQuantity(id, -1);
        });
    });

    // Remove buttons
    const removeBtns = document.querySelectorAll('.cart-remove-btn');
    removeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.currentTarget.getAttribute('data-id'));
            removeFromCart(id);
        });
    });
}

// ==========================================================================
// DRAWER & MODAL VIEW CONTROLLERS
// ==========================================================================

// Cart Slide Drawer Controllers
function openCartDrawer() {
    cartDrawer.classList.add('active');
    cartOverlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // Lock main scroll
}

function closeCartDrawer() {
    cartDrawer.classList.remove('active');
    cartOverlay.classList.remove('active');
    document.body.style.overflow = ''; // Restore main scroll
}

// Product Details Modal Controllers
function openProductDetails(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    modalProductImg.src = product.image;
    modalProductImg.alt = product.name;
    modalProductCategory.textContent = product.category;
    modalProductName.textContent = product.name;
    modalProductPrice.textContent = `$${product.price}`;
    modalProductDescription.textContent = product.description;
    
    // Bind current product ID to modal add to cart button
    modalAddToCartBtn.setAttribute('data-id', product.id);

    detailsModal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Lock main scroll
}

function closeProductDetails() {
    detailsModal.style.display = 'none';
    
    // Only restore body scroll if Cart drawer is also closed
    if (!cartDrawer.classList.contains('active')) {
        document.body.style.overflow = '';
    }
}

// ==========================================================================
// GLOBAL EVENT LISTENERS CONFIG
// ==========================================================================
function setupEventListeners() {
    // 1. Navigation Category Links (Header)
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const category = e.currentTarget.getAttribute('data-category');
            updateActiveCategory(category);
            // Smooth scroll to top of listing main area
            window.scrollTo({
                top: document.querySelector('.main-content').offsetTop - 100,
                behavior: 'smooth'
            });
        });
    });

    // Brand Logo Reset
    document.getElementById('brand-logo').addEventListener('click', (e) => {
        e.preventDefault();
        resetAllFilters();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // 2. Sidebar Category Buttons
    sidebarFilterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const category = e.currentTarget.getAttribute('data-filter-category');
            updateActiveCategory(category);
        });
    });

    // 3. Price Filter Slider
    priceSlider.addEventListener('input', (e) => {
        maxPrice = parseInt(e.target.value);
        priceMaxValLabel.textContent = `$${maxPrice}`;
        filterAndRenderProducts();
    });

    // 4. Clear/Reset Filters Buttons
    clearFiltersBtn.addEventListener('click', resetAllFilters);
    resetFiltersLink.addEventListener('click', resetAllFilters);

    // 5. Cart Drawer Triggers
    cartToggle.addEventListener('click', openCartDrawer);
    cartClose.addEventListener('click', closeCartDrawer);
    cartOverlay.addEventListener('click', closeCartDrawer);

    // Checkout button redirect to checkout page
    checkoutBtn.addEventListener('click', () => {
        window.location.href = 'checkout.html';
    });

    // 6. Modal Closing Triggers
    modalClose.addEventListener('click', closeProductDetails);
    
    detailsModal.addEventListener('click', (e) => {
        // Close modal when clicking on the overlay container outside of dialog content
        if (e.target === detailsModal) {
            closeProductDetails();
        }
    });

    // Modal internal add to cart action binding
    modalAddToCartBtn.addEventListener('click', (e) => {
        const id = parseInt(e.currentTarget.getAttribute('data-id'));
        addToCart(id);
        closeProductDetails();
    });

    // 7. General Keyboard Accessibility (ESC Key closes overlays)
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeProductDetails();
            closeCartDrawer();
        }
    });
}
