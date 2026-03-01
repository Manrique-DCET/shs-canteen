/**
 * Admin Dashboard Logic
 */

const adminApp = {
    state: {
        token: null,
        user: null,
        orders: [],
        products: [],
        analytics: {},
        reviews: [],
        activePanel: 'orders-panel'
    },

    init() {
        this.cacheDOM();
        this.bindEvents();
        this.checkAuth();
    },

    cacheDOM() {
        // Auth elements
        this.authOverlay = document.getElementById('auth-overlay');
        this.adminLayout = document.getElementById('admin-layout');
        this.loginForm = document.getElementById('admin-login-form');
        this.emailInput = document.getElementById('admin-email');
        this.passwordInput = document.getElementById('admin-password');

        this.navItems = document.querySelectorAll('.nav-item[data-target]');
        this.panels = document.querySelectorAll('.panel');
        this.pageTitle = document.getElementById('current-page-title');

        // Orders
        this.ordersList = document.getElementById('orders-list');

        // Inventory
        this.inventoryList = document.getElementById('inventory-list');

        // Analytics
        this.totalRevenue = document.getElementById('total-revenue');
        this.totalOrders = document.getElementById('total-orders');
        this.avgRating = document.getElementById('avg-rating');
        this.popularItemsList = document.getElementById('popular-items-list');

        // Reviews
        this.reviewsContainer = document.getElementById('reviews-container');

        // Mobile Nav
        this.mobileNavToggle = document.getElementById('mobile-nav-toggle');
        this.sidebar = document.querySelector('.sidebar');

        // Other Buttons
        this.logoutBtn = document.getElementById('logout-btn');
        this.addItemBtn = document.getElementById('add-item-btn');

        // Modal Elements
        this.addItemModal = document.getElementById('add-item-modal');
        this.closeAddModal = document.getElementById('close-add-modal');
        this.addItemForm = document.getElementById('add-item-form');
        this.newItemName = document.getElementById('new-item-name');
        this.newItemCategory = document.getElementById('new-item-category');
        this.newItemPrice = document.getElementById('new-item-price');
        this.newItemImage = document.getElementById('new-item-image');
        this.saveItemBtn = document.getElementById('save-item-btn');
    },

    bindEvents() {
        // Auth
        if (this.loginForm) {
            this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
        this.navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                this.switchPanel(e.currentTarget.dataset.target, e.currentTarget);
                // Close sidebar on mobile after clicking
                if (window.innerWidth <= 768) {
                    this.toggleMobileNav(false);
                }
            });
        });

        if (this.mobileNavToggle) {
            this.mobileNavToggle.addEventListener('click', () => {
                const isOpen = this.sidebar.classList.contains('open');
                this.toggleMobileNav(!isOpen);
            });
        }

        if (this.logoutBtn) {
            this.logoutBtn.addEventListener('click', () => {
                this.handleLogout();
            });
        }

        // Add Item Modal
        if (this.addItemBtn) {
            this.addItemBtn.addEventListener('click', () => {
                this.addItemModal.classList.remove('hidden');
            });
        }
        if (this.closeAddModal) {
            this.closeAddModal.addEventListener('click', () => {
                this.addItemModal.classList.add('hidden');
                this.addItemForm.reset();
            });
        }
        if (this.addItemForm) {
            this.addItemForm.addEventListener('submit', (e) => this.handleAddItem(e));
        }

        // Click outside to close
        document.addEventListener('click', (e) => {
            if (this.sidebar && this.sidebar.classList.contains('open') &&
                document.body.classList.contains('sidebar-open') &&
                e.target.tagName.toLowerCase() === 'body') {
                this.toggleMobileNav(false);
            }
        });

        // Auto-refresh orders every 30 seconds
        setInterval(() => {
            if (this.state.activePanel === 'orders-panel') {
                this.fetchOrders(true); // silent refresh
            }
        }, 30000);
    },

    toggleMobileNav(show) {
        if (show) {
            this.sidebar.classList.add('open');
            document.body.classList.add('sidebar-open');
        } else {
            this.sidebar.classList.remove('open');
            document.body.classList.remove('sidebar-open');
        }
    },

    switchPanel(panelId, navElement) {
        // Update Nav Active State
        this.navItems.forEach(item => item.classList.remove('active'));
        navElement.classList.add('active');

        // Update Title
        this.pageTitle.textContent = navElement.querySelector('span').textContent;

        // Update Panels
        this.panels.forEach(panel => {
            panel.classList.add('hidden');
            panel.classList.remove('active', 'slide-up');
        });

        const activePanel = document.getElementById(panelId);
        activePanel.classList.remove('hidden');
        // Force reflow to restart animation
        void activePanel.offsetWidth;
        activePanel.classList.add('active', 'slide-up');

        this.state.activePanel = panelId;

        // Fetch data based on panel
        if (panelId === 'orders-panel') this.fetchOrders();
        else if (panelId === 'inventory-panel') this.fetchInventory();
        else if (panelId === 'analytics-panel') this.fetchAnalytics();
        else if (panelId === 'reviews-panel') this.fetchReviews();
    },

    formatCurrency(amount) {
        return `₱${parseFloat(amount).toFixed(2)}`;
    },

    getStatusBadge(status) {
        const statusClass = status.toLowerCase();
        return `<span class="badge badge-${statusClass}">${status}</span>`;
    },

    // ==========================================
    // Authentication
    // ==========================================
    checkAuth() {
        const token = localStorage.getItem('admin_token');
        if (token) {
            this.state.token = token;
            this.authOverlay.classList.add('hidden');
            this.authOverlay.classList.remove('active');
            this.adminLayout.classList.remove('hidden');
            this.fetchOrders();
        } else {
            this.authOverlay.classList.remove('hidden');
            this.authOverlay.classList.add('active');
            this.adminLayout.classList.add('hidden');
        }
    },

    async handleLogin(e) {
        e.preventDefault();
        const email = this.emailInput.value.trim();
        const password = this.passwordInput.value;

        if (!email || !password) return;

        try {
            const res = await fetch(`${window.config.apiUrl}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (res.ok) {
                const data = await res.json();
                if (data.role !== 'admin') {
                    alert('Access denied: You are not an admin.');
                    return;
                }
                localStorage.setItem('admin_token', data.token);
                this.state.token = data.token;

                this.authOverlay.classList.add('hidden');
                this.authOverlay.classList.remove('active');
                this.adminLayout.classList.remove('hidden');
                this.fetchOrders();
            } else {
                const errData = await res.json();
                alert(errData.message || 'Login failed.');
            }
        } catch (error) {
            console.error('Login error', error);
            alert('An error occurred during login.');
        }
    },

    handleLogout() {
        localStorage.removeItem('admin_token');
        this.state.token = null;
        this.emailInput.value = '';
        this.passwordInput.value = '';
        this.checkAuth();
    },

    getAuthHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.state.token}`
        };
    },

    // ==========================================
    // Orders
    // ==========================================
    async fetchOrders(silent = false) {
        try {
            if (!silent) {
                this.ordersList.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4"><i class="fa-solid fa-spinner fa-spin fa-2x mb-2"></i><p>Loading orders...</p></td></tr>`;
            }

            const res = await fetch(`${window.config.apiUrl}/orders?role=admin`, {
                headers: this.getAuthHeaders()
            });
            if (res.status === 401 || res.status === 403) return this.handleLogout();
            const orders = await res.json();
            this.state.orders = orders;

            this.renderOrders();
        } catch (error) {
            console.error('Failed to fetch orders', error);
            if (!silent) {
                this.ordersList.innerHTML = `<tr><td colspan="6" class="text-center text-danger py-4">Failed to load orders.</td></tr>`;
            }
        }
    },

    renderOrders() {
        if (this.state.orders.length === 0) {
            this.ordersList.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">No active orders right now.</td></tr>`;
            return;
        }

        this.ordersList.innerHTML = this.state.orders.map(order => {
            const itemsList = order.items.map(i => `${i.quantity}x ${i.product ? i.product.name : 'Unknown'}`).join('<br>');
            const studentName = order.user ? order.user.name : 'Guest';

            let actionBtn = '';
            if (order.status === 'Pending') {
                actionBtn = `<button class="btn btn-sm btn-primary" onclick="adminApp.updateOrderStatus('${order._id}', 'Preparing')">Accept</button>`;
            } else if (order.status === 'Preparing') {
                actionBtn = `<button class="btn btn-sm btn-success" onclick="adminApp.updateOrderStatus('${order._id}', 'Ready')">Mark Ready</button>`;
            } else if (order.status === 'Ready') {
                actionBtn = `<button class="btn btn-sm btn-outline" onclick="adminApp.updateOrderStatus('${order._id}', 'Completed')">Complete</button>`;
            }

            return `
                <tr>
                    <td><strong>#${order._id.substring(order._id.length - 6).toUpperCase()}</strong></td>
                    <td>${studentName}</td>
                    <td><small>${itemsList}</small></td>
                    <td><strong>${this.formatCurrency(order.totalAmount)}</strong></td>
                    <td>${this.getStatusBadge(order.status)}</td>
                    <td>${actionBtn}</td>
                </tr>
            `;
        }).join('');
    },

    async updateOrderStatus(orderId, newStatus) {
        try {
            const res = await fetch(`${window.config.apiUrl}/orders/${orderId}/status`, {
                method: 'PUT',
                headers: this.getAuthHeaders(),
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                // Optimistic update
                const order = this.state.orders.find(o => o._id === orderId);
                if (order) order.status = newStatus;
                this.renderOrders();

                // If marked as ready, show a subtle notification that email was sent
                if (newStatus === 'Ready') {
                    console.log('Email notification triggered for order', orderId);
                }
            }
        } catch (error) {
            console.error('Failed to update status', error);
            alert('Failed to update status');
        }
    },

    // ==========================================
    // Inventory
    // ==========================================
    async fetchInventory() {
        try {
            this.inventoryList.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-4"><i class="fa-solid fa-spinner fa-spin fa-2x mb-2"></i><p>Loading inventory...</p></td></tr>`;

            const res = await fetch(`${window.config.apiUrl}/products`);
            const products = await res.json();
            this.state.products = products;

            this.renderInventory();
        } catch (error) {
            console.error('Failed to fetch inventory', error);
            this.inventoryList.innerHTML = `<tr><td colspan="4" class="text-center text-danger py-4">Failed to load inventory.</td></tr>`;
        }
    },

    renderInventory() {
        if (this.state.products.length === 0) {
            this.inventoryList.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-4">No products found.</td></tr>`;
            return;
        }

        this.inventoryList.innerHTML = this.state.products.map(product => {
            const checked = !product.inStock ? 'checked' : '';
            return `
                <tr>
                    <td><strong>${product.name}</strong></td>
                    <td>${product.category}</td>
                    <td>${this.formatCurrency(product.price)}</td>
                    <td>
                        <label class="switch">
                            <input type="checkbox" ${checked} onchange="adminApp.toggleStock('${product._id}', this.checked)">
                            <span class="slider"></span>
                        </label>
                    </td>
                </tr>
            `;
        }).join('');
    },

    async toggleStock(productId, isOut) {
        try {
            const inStock = !isOut;
            const res = await fetch(`${window.config.apiUrl}/products/${productId}`, {
                method: 'PUT',
                headers: this.getAuthHeaders(),
                body: JSON.stringify({ inStock })
            });

            if (!res.ok) {
                if (res.status === 401 || res.status === 403) return this.handleLogout();
                throw new Error('Failed to update stock status');
            }
        } catch (error) {
            console.error(error);
            alert('Error updating stock status');
            this.fetchInventory(); // revert state visually
        }
    },

    async handleAddItem(e) {
        e.preventDefault();

        const name = this.newItemName.value.trim();
        const category = this.newItemCategory.value;
        const price = parseFloat(this.newItemPrice.value);
        const image = this.newItemImage.value.trim();

        if (!name || isNaN(price)) return;

        this.saveItemBtn.disabled = true;
        this.saveItemBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

        try {
            const res = await fetch(`${window.config.apiUrl}/products`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify({ name, category, price, image })
            });

            if (res.ok) {
                this.addItemModal.classList.add('hidden');
                this.addItemForm.reset();
                this.fetchInventory(); // Refresh the list
            } else {
                if (res.status === 401 || res.status === 403) return this.handleLogout();
                throw new Error('Failed to save product');
            }
        } catch (error) {
            console.error('Add item error:', error);
            alert('Error adding new product');
        } finally {
            this.saveItemBtn.disabled = false;
            this.saveItemBtn.innerHTML = 'Save Product';
        }
    },

    // ==========================================
    // Analytics
    // ==========================================
    async fetchAnalytics() {
        try {
            const res = await fetch(`${window.config.apiUrl}/analytics`, {
                headers: this.getAuthHeaders()
            });
            if (res.status === 401 || res.status === 403) return this.handleLogout();
            const data = await res.json();
            this.state.analytics = data;

            // Update Top KPIs
            this.totalRevenue.textContent = this.formatCurrency(data.totalRevenue);
            this.totalOrders.textContent = data.totalOrders;
            this.avgRating.textContent = `${data.averageGeneralRating} / 5.0`;

            // Render Popular Items
            if (data.popularItems.length === 0) {
                this.popularItemsList.innerHTML = `<tr><td colspan="3" class="text-center text-muted py-4">No sales data yet.</td></tr>`;
            } else {
                this.popularItemsList.innerHTML = data.popularItems.map(item => `
                    <tr>
                        <td><strong>${item.name}</strong></td>
                        <td>${item.quantity}</td>
                        <td>${this.formatCurrency(item.revenue)}</td>
                    </tr>
                `).join('');
            }

        } catch (error) {
            console.error('Failed to fetch analytics', error);
        }
    },

    // ==========================================
    // Reviews
    // ==========================================
    async fetchReviews() {
        try {
            this.reviewsContainer.innerHTML = `<div class="text-center text-muted" style="grid-column: 1 / -1; padding: 3rem;"><i class="fa-solid fa-spinner fa-spin fa-2x mb-2"></i><p>Loading reviews...</p></div>`;

            const res = await fetch(`${window.config.apiUrl}/reviews`, {
                headers: this.getAuthHeaders()
            });
            if (res.status === 401 || res.status === 403) return this.handleLogout();
            const reviews = await res.json();
            this.state.reviews = reviews;

            if (reviews.length === 0) {
                this.reviewsContainer.innerHTML = `<div class="text-center text-muted" style="grid-column: 1 / -1; padding: 3rem;">No feedback received yet.</div>`;
                return;
            }

            this.reviewsContainer.innerHTML = reviews.map(review => {
                const stars = Array(5).fill(0).map((_, i) =>
                    `<i class="fa-${i < review.rating ? 'solid' : 'regular'} fa-star"></i>`
                ).join('');

                const userName = review.user ? review.user.name : 'Anonymous Student';
                const date = new Date(review.createdAt).toLocaleDateString();
                const productName = review.product ? `Regarding: ${review.product.name}` : 'General Kiosk Experience';

                return `
                    <div class="glass-card review-card fade-in">
                        <div class="review-header">
                            <div>
                                <strong>${userName}</strong>
                                <div style="font-size: 0.8rem; color: var(--text-muted);">${date} - ${productName}</div>
                            </div>
                            <div class="review-stars">${stars}</div>
                        </div>
                        <p class="review-text">"${review.comment || 'No comment provided.'}"</p>
                    </div>
                `;
            }).join('');

        } catch (error) {
            console.error('Failed to fetch reviews', error);
            this.reviewsContainer.innerHTML = `<div class="text-center text-danger" style="grid-column: 1 / -1; padding: 3rem;">Failed to load reviews.</div>`;
        }
    }
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    adminApp.init();
});
