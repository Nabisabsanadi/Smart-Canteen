// Smart Canteen Menu - Vanilla JavaScript Logic
const API_BASE_URL = 'http://localhost:5000/api';

// State Management
let menuItems = [];
let categories = [];
let cart = [];
let activeCategory = 'all';

// DOM Selectors
const menuGrid = document.getElementById('menu-grid');
const categoryFilters = document.getElementById('category-filters');
const searchInput = document.getElementById('search-input');
const menuLoading = document.getElementById('menu-loading');
const menuEmpty = document.getElementById('menu-empty');
const menuError = document.getElementById('menu-error');
const errorMessage = document.getElementById('error-message');

const cartBtn = document.getElementById('cart-btn');
const cartModal = document.getElementById('cart-modal');
const closeCartBtn = document.getElementById('close-cart-btn');
const cartCount = document.getElementById('cart-count');
const cartItemsContainer = document.getElementById('cart-items');
const emptyCartMsg = document.getElementById('empty-cart-msg');
const cartTotalPrice = document.getElementById('cart-total-price');
const cartTotalCount = document.getElementById('cart-total-count');
const checkoutForm = document.getElementById('checkout-form');

const menuForm = document.getElementById('menu-form');
const itemIdInput = document.getElementById('item-id');
const itemNameInput = document.getElementById('item-name');
const itemPriceInput = document.getElementById('item-price');
const itemCategorySelect = document.getElementById('item-category');
const itemDescInput = document.getElementById('item-description');
const itemImageInput = document.getElementById('item-image');
const itemAvailableCheckbox = document.getElementById('item-available');
const formTitle = document.getElementById('form-title');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
const ordersList = document.getElementById('orders-list');

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    fetchCategories();
    fetchMenuItems();
    fetchOrders();

    // Event Listeners
    searchInput.addEventListener('input', handleSearch);
    cartBtn.addEventListener('click', toggleCartModal);
    closeCartBtn.addEventListener('click', toggleCartModal);
    checkoutForm.addEventListener('submit', handleCheckout);
    menuForm.addEventListener('submit', handleFormSubmit);
    cancelEditBtn.addEventListener('click', resetForm);
});

// Toast Notification Helper
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'fa-circle-info';
    if (type === 'success') icon = 'fa-circle-check';
    if (type === 'error') icon = 'fa-circle-exclamation';

    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3500);
}

// -------------------------------------------------------------------
// API FETCH OPERATIONS
// -------------------------------------------------------------------

// Fetch Categories
async function fetchCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}/categories`);
        if (!response.ok) throw new Error('Failed to load categories');
        categories = await response.json();
        renderCategoryFilters();
        renderCategoryOptions();
    } catch (err) {
        console.error('Category fetch error:', err);
    }
}

// Fetch Menu Items
async function fetchMenuItems() {
    menuLoading.classList.remove('hidden');
    menuEmpty.classList.add('hidden');
    menuError.classList.add('hidden');
    menuGrid.innerHTML = '';

    try {
        const response = await fetch(`${API_BASE_URL}/menu`);
        if (!response.ok) throw new Error('Failed to connect to menu API service');
        
        menuItems = await response.json();
        menuLoading.classList.add('hidden');
        renderMenu();
    } catch (err) {
        menuLoading.classList.add('hidden');
        menuError.classList.remove('hidden');
        errorMessage.textContent = err.message || 'Make sure your backend server (http://localhost:5000) is running.';
    }
}

// Fetch Admin Orders
async function fetchOrders() {
    if (!ordersList) return;
    try {
        const response = await fetch(`${API_BASE_URL}/orders`);
        if (!response.ok) throw new Error('Failed to fetch orders');
        const orders = await response.json();
        renderOrders(orders);
    } catch (err) {
        console.error('Orders fetch error:', err);
        ordersList.innerHTML = `<p style="color:var(--text-muted);">Unable to load orders.</p>`;
    }
}

// -------------------------------------------------------------------
// RENDER UI FUNCTIONS
// -------------------------------------------------------------------

// Render Category Filters
function renderCategoryFilters() {
    categoryFilters.innerHTML = `<button class="pill-btn ${activeCategory === 'all' ? 'active' : ''}" onclick="filterByCategory('all')">All Items</button>`;
    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = `pill-btn ${activeCategory === String(cat.id) ? 'active' : ''}`;
        btn.textContent = cat.name;
        btn.onclick = () => filterByCategory(cat.id);
        categoryFilters.appendChild(btn);
    });
}

// Render Select Options for Admin Form
function renderCategoryOptions() {
    itemCategorySelect.innerHTML = '<option value="">Select Category</option>';
    categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat.id;
        opt.textContent = cat.name;
        itemCategorySelect.appendChild(opt);
    });
}

// Filter Menu by Category
function filterByCategory(catId) {
    activeCategory = String(catId);
    renderCategoryFilters();
    renderMenu();
}

// Handle Search Query Filter
function handleSearch() {
    renderMenu();
}

// Render Menu Cards
function renderMenu() {
    const query = searchInput.value.toLowerCase().trim();

    const filtered = menuItems.filter(item => {
        const matchesCat = activeCategory === 'all' || String(item.category_id) === activeCategory;
        const matchesSearch = item.name.toLowerCase().includes(query) || 
                              (item.description && item.description.toLowerCase().includes(query));
        return matchesCat && matchesSearch;
    });

    menuGrid.innerHTML = '';

    if (filtered.length === 0) {
        menuEmpty.classList.remove('hidden');
        return;
    }

    menuEmpty.classList.add('hidden');

    filtered.forEach(item => {
        const card = document.createElement('div');
        card.className = 'menu-card';

        const categoryObj = categories.find(c => c.id === item.category_id);
        const categoryName = categoryObj ? categoryObj.name : 'General';
        const isAvail = item.is_available;

        card.innerHTML = `
            <div class="card-img-wrapper">
                <img src="${item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'}" alt="${item.name}">
                <span class="availability-tag ${isAvail ? 'available' : 'unavailable'}">
                    ${isAvail ? 'Available' : 'Sold Out'}
                </span>
            </div>
            <div class="card-body">
                <span class="card-category">${categoryName}</span>
                <h3 class="card-title">${item.name}</h3>
                <p class="card-desc">${item.description || 'No description provided.'}</p>
                <div class="card-footer">
                    <span class="card-price">₹${parseFloat(item.price).toFixed(2)}</span>
                    <div class="card-actions">
                        <button onclick="editItem(${item.id})" class="btn btn-sm btn-outline" title="Edit Item">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button onclick="deleteItem(${item.id})" class="btn btn-sm btn-outline" title="Delete Item">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                        <button onclick="addToCart(${item.id})" class="btn btn-sm btn-accent" ${!isAvail ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>
                            <i class="fa-solid fa-cart-plus"></i> Add
                        </button>
                    </div>
                </div>
            </div>
        `;

        menuGrid.appendChild(card);
    });
}

// Render Recent Admin Orders
function renderOrders(orders) {
    if (!orders || orders.length === 0) {
        ordersList.innerHTML = `<p style="color:var(--text-muted);">No orders placed yet today.</p>`;
        return;
    }

    ordersList.innerHTML = '';
    orders.forEach(ord => {
        const div = document.createElement('div');
        div.className = 'order-card';
        div.innerHTML = `
            <div class="order-header">
                <span>Order #${ord.id} - ${ord.customer_name}</span>
                <span class="order-status ${ord.status}">${ord.status}</span>
            </div>
            <div class="order-details">
                <p>Phone: ${ord.customer_phone}</p>
                <p>Total: <strong>₹${parseFloat(ord.total_amount).toFixed(2)}</strong></p>
                <div style="margin-top:6px;">
                    <select onchange="updateOrderStatus(${ord.id}, this.value)" style="padding:4px; font-size:0.8rem;">
                        <option value="Pending" ${ord.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="Preparing" ${ord.status === 'Preparing' ? 'selected' : ''}>Preparing</option>
                        <option value="Ready" ${ord.status === 'Ready' ? 'selected' : ''}>Ready for Pickup</option>
                        <option value="Completed" ${ord.status === 'Completed' ? 'selected' : ''}>Completed</option>
                    </select>
                </div>
            </div>
        `;
        ordersList.appendChild(div);
    });
}

// -------------------------------------------------------------------
// CART OPERATIONS
// -------------------------------------------------------------------

function toggleCartModal() {
    cartModal.classList.toggle('hidden');
    renderCart();
}

function addToCart(itemId) {
    const item = menuItems.find(i => i.id === itemId);
    if (!item || !item.is_available) return;

    const existing = cart.find(c => c.id === itemId);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...item, quantity: 1 });
    }

    updateCartBadge();
    showToast(`Added ${item.name} to cart`, 'success');
}

function updateCartBadge() {
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalCount;
}

function renderCart() {
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        emptyCartMsg.classList.remove('hidden');
        cartTotalPrice.textContent = '0.00';
        cartTotalCount.textContent = '0';
        return;
    }

    emptyCartMsg.classList.add('hidden');
    let grandTotal = 0;
    let totalItems = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        grandTotal += itemTotal;
        totalItems += item.quantity;

        const row = document.createElement('div');
        row.className = 'cart-item';
        row.innerHTML = `
            <div>
                <strong>${item.name}</strong>
                <div style="font-size:0.85rem; color:var(--text-muted);">₹${item.price} x ${item.quantity} = ₹${itemTotal.toFixed(2)}</div>
            </div>
            <div style="display:flex; gap:6px; align-items:center;">
                <button onclick="changeQuantity(${item.id}, -1)" class="qty-btn">-</button>
                <span>${item.quantity}</span>
                <button onclick="changeQuantity(${item.id}, 1)" class="qty-btn">+</button>
            </div>
        `;
        cartItemsContainer.appendChild(row);
    });

    cartTotalPrice.textContent = grandTotal.toFixed(2);
    cartTotalCount.textContent = totalItems;
}

function changeQuantity(itemId, delta) {
    const item = cart.find(c => c.id === itemId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
        cart = cart.filter(c => c.id !== itemId);
    }

    updateCartBadge();
    renderCart();
}

// Handle Order Checkout
async function handleCheckout(e) {
    e.preventDefault();
    if (cart.length === 0) {
        showToast('Your cart is empty!', 'error');
        return;
    }

    const name = document.getElementById('customer-name').value.trim();
    const phone = document.getElementById('customer-phone').value.trim();
    const grandTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

    try {
        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                customer_name: name,
                customer_phone: phone,
                items: cart,
                total_amount: grandTotal
            })
        });

        if (!response.ok) throw new Error('Failed to submit order');

        const data = await response.json();
        showToast(`Order #${data.orderId} placed successfully!`, 'success');
        
        // Clear Cart & Form
        cart = [];
        updateCartBadge();
        checkoutForm.reset();
        toggleCartModal();
        fetchOrders(); // Refresh admin orders list
    } catch (err) {
        showToast(err.message || 'Checkout failed', 'error');
    }
}

// -------------------------------------------------------------------
// CRUD OPERATIONS (CREATE, UPDATE, DELETE MENU ITEM)
// -------------------------------------------------------------------

async function handleFormSubmit(e) {
    e.preventDefault();
    
    const id = itemIdInput.value;
    const name = itemNameInput.value.trim();
    const price = itemPriceInput.value;
    const category_id = itemCategorySelect.value;
    const description = itemDescInput.value.trim();
    const image_url = itemImageInput.value.trim();
    const is_available = itemAvailableCheckbox.checked;

    const payload = { name, price, category_id, description, image_url, is_available };

    try {
        let response;
        if (id) {
            // Update existing
            response = await fetch(`${API_BASE_URL}/menu/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } else {
            // Create new
            response = await fetch(`${API_BASE_URL}/menu`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        }

        if (!response.ok) throw new Error('Failed to save menu item');

        showToast(id ? 'Menu item updated!' : 'Menu item added successfully!', 'success');
        resetForm();
        fetchMenuItems();
    } catch (err) {
        showToast(err.message || 'Error saving item', 'error');
    }
}

function editItem(id) {
    const item = menuItems.find(i => i.id === id);
    if (!item) return;

    itemIdInput.value = item.id;
    itemNameInput.value = item.name;
    itemPriceInput.value = item.price;
    itemCategorySelect.value = item.category_id;
    itemDescInput.value = item.description || '';
    itemImageInput.value = item.image_url || '';
    itemAvailableCheckbox.checked = item.is_available;

    formTitle.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Edit Menu Item #${item.id}`;
    cancelEditBtn.classList.remove('hidden');

    // Scroll smoothly to form
    document.getElementById('admin-section').scrollIntoView({ behavior: 'smooth' });
}

async function deleteItem(id) {
    if (!confirm('Are you sure you want to delete this menu item?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/menu/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete item');

        showToast('Menu item deleted', 'info');
        fetchMenuItems();
    } catch (err) {
        showToast(err.message || 'Error deleting item', 'error');
    }
}

async function updateOrderStatus(orderId, newStatus) {
    try {
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });

        if (!response.ok) throw new Error('Failed to update status');

        showToast(`Order #${orderId} status changed to ${newStatus}`, 'info');
        fetchOrders();
    } catch (err) {
        showToast('Error updating status', 'error');
    }
}

function resetForm() {
    menuForm.reset();
    itemIdInput.value = '';
    formTitle.innerHTML = `<i class="fa-solid fa-plus-circle"></i> Add New Menu Item`;
    cancelEditBtn.classList.add('hidden');
}