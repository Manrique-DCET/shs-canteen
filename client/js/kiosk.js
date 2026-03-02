/**
 * Student Kiosk Logic
 */

const kioskApp = {
    state: {
        user: null, // { name, email }
        stallName: null,
        products: [],
        currentCategory: 'All',
        cart: [] // { _id, name, price, quantity, img }
    },

    init() {
        const params = new URLSearchParams(window.location.search);
        this.state.stallName = params.get('stall');
        if (!this.state.stallName) {
            window.location.href = 'index.html';
            return;
        }

        this.cacheDOM();
        this.updateHeader();
        this.bindEvents();
        this.checkAuth();
        this.fetchProducts();
    },

    updateHeader() {
        const logoText = document.querySelector('.logo-text');
        if (logoText) {
            logoText.innerHTML = `Order <span class="text-gold">${this.state.stallName}</span>`;
        }
    },

    cacheDOM() {
        // Auth
        this.currentStudentDisplay = document.getElementById('current-student');
        this.logoutBtn = document.getElementById('student-logout-btn');

        // Menu Area
        this.categoryBtns = document.querySelectorAll('.category-btn');
        this.menuGrid = document.getElementById('menu-grid');

        // Cart Area
        this.cartItemsContainer = document.getElementById('cart-items-container');
        this.cartCount = document.getElementById('cart-count');
        this.cartTotalAmount = document.getElementById('cart-total-amount');
        this.checkoutBtn = document.getElementById('checkout-btn');
        this.mobileCartBadge = document.getElementById('mobile-cart-badge'); // New mobile badge

        // Modal
        this.orderModal = document.getElementById('order-modal');
        this.displayOrderId = document.getElementById('display-order-id');
        this.closeModalBtn = document.getElementById('close-order-modal');

        // Feedback Modal
        this.feedbackBtn = document.getElementById('feedback-btn');
        this.feedbackModal = document.getElementById('feedback-modal');
        this.closeFeedbackBtn = document.getElementById('close-feedback-modal');
        this.feedbackForm = document.getElementById('student-feedback-form');
        this.stars = document.querySelectorAll('#star-rating i');
        this.ratingInput = document.getElementById('feedback-rating');
        this.feedbackComment = document.getElementById('feedback-comment');
        this.submitFeedbackBtn = document.getElementById('submit-feedback-btn');
    },

    bindEvents() {
        // Auth
        if (this.logoutBtn) {
            this.logoutBtn.addEventListener('click', () => this.handleLogout());
        }

        // Categories
        this.categoryBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.categoryBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.state.currentCategory = e.target.dataset.category;
                this.renderMenu();
            });
        });

        // Cart & Checkout
        this.checkoutBtn.addEventListener('click', () => this.handleCheckout());

        // Modal
        this.closeModalBtn.addEventListener('click', () => {
            this.orderModal.classList.add('hidden');
            this.clearCart();
        });

        // Feedback System
        if (this.feedbackBtn) {
            this.feedbackBtn.addEventListener('click', () => this.feedbackModal.classList.remove('hidden'));
        }

        if (this.closeFeedbackBtn) {
            this.closeFeedbackBtn.addEventListener('click', () => {
                this.feedbackModal.classList.add('hidden');
                this.resetFeedbackForm();
            });
        }

        // Star Rating Logic
        this.stars.forEach(star => {
            star.addEventListener('mouseover', (e) => {
                const rating = e.target.dataset.rating;
                this.highlightStars(rating);
            });

            star.addEventListener('mouseout', () => {
                this.highlightStars(this.ratingInput.value);
            });

            star.addEventListener('click', (e) => {
                this.ratingInput.value = e.target.dataset.rating;
                this.highlightStars(this.ratingInput.value);
            });
        });

        // Submit Feedback
        if (this.feedbackForm) {
            this.feedbackForm.addEventListener('submit', (e) => this.handleFeedbackSubmit(e));
        }

        // Mobile Cart Toggle
        const mobileToggle = document.getElementById('mobile-cart-toggle');
        const closeCartBtn = document.getElementById('close-cart-btn');

        if (mobileToggle && closeCartBtn) {
            mobileToggle.addEventListener('click', () => {
                document.body.classList.add('cart-open');
            });

            closeCartBtn.addEventListener('click', () => {
                document.body.classList.remove('cart-open');
            });

            // Close cart when clicking outside on mobile
            document.addEventListener('click', (e) => {
                if (document.body.classList.contains('cart-open') &&
                    e.target.tagName.toLowerCase() === 'body') {
                    document.body.classList.remove('cart-open');
                }
            });
        }
    },

    formatCurrency(amount) {
        return `₱${parseFloat(amount).toFixed(2)}`;
    },

    // ==========================================
    // Authentication
    // ==========================================
    checkAuth() {
        const storedUser = localStorage.getItem('canteen_student');
        if (storedUser) {
            this.state.user = JSON.parse(storedUser);
            if (this.currentStudentDisplay) {
                this.currentStudentDisplay.innerHTML = `<span>Welcome, <strong>${this.state.user.name}</strong></span> 
                <button class="btn btn-sm btn-outline ml-2" id="student-logout-btn" onclick="kioskApp.handleLogout()">Exit</button>
                <button class="btn btn-sm btn-gold ml-2" id="feedback-btn"><i class="fa-solid fa-star"></i> Feedback</button>`;

                // Rebind the newly created feedback button
                this.feedbackBtn = document.getElementById('feedback-btn');
                if (this.feedbackBtn) {
                    this.feedbackBtn.addEventListener('click', () => this.feedbackModal.classList.remove('hidden'));
                }
            }
        } else {
            // Not logged in, redirect to login page
            window.location.href = 'login.html';
        }
    },

    handleLogout() {
        localStorage.removeItem('canteen_student');
        this.state.user = null;
        this.clearCart();
        window.location.href = 'login.html';
    },

    // ==========================================
    // Products & Menu Display
    // ==========================================
    async fetchProducts() {
        try {
            const res = await fetch(`${window.config.apiUrl}/products?stall=${encodeURIComponent(this.state.stallName)}`);
            const products = await res.json();
            this.state.products = products;
            this.renderMenu();
        } catch (error) {
            console.error(error);
            showToast("Error logging in. Please try again.", "error");
            this.menuGrid.innerHTML = `<div class="text-center text-danger py-5" style="grid-column: 1/-1;"><h3>Could not load menu. Please ask staff.</h3></div>`;
        }
    },

    renderMenu() {
        let filtered = this.state.products;
        if (this.state.currentCategory !== 'All') {
            filtered = this.state.products.filter(p => p.category === this.state.currentCategory);
        }

        if (filtered.length === 0) {
            this.menuGrid.innerHTML = `
                <div class="text-center text-muted col-span-full py-5" style="grid-column: 1/-1;">
                    <i class="fa-solid fa-utensils fa-3x mb-3"></i>
                    <h3>No items found in this category.</h3>
                </div>`;
            return;
        }

        this.menuGrid.innerHTML = filtered.map((product, index) => {
            const isOut = product.isOutOfStock;
            const delay = index * 0.05;

            // Image placeholder if undefined
            const imgUrl = product.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=fit&w=500&q=60';

            return `
                <div class="product-card ${isOut ? 'out-of-stock' : 'slide-up'}" style="animation-delay: ${delay}s" onclick="${!isOut ? `kioskApp.addToCart('${product._id}')` : ''}">
                    ${isOut ? '<div class="out-of-stock-tag">Ubos na!</div>' : ''}
                    <div class="product-tag">${product.category}</div>
                    <div class="product-image-container">
                        <img src="${imgUrl}" alt="${product.name}" class="product-image" loading="lazy">
                    </div>
                    <div class="product-info">
                        <h3 class="product-name">${product.name}</h3>
                        <div class="product-price">${this.formatCurrency(product.price)}</div>
                        <button class="add-to-cart-btn" ${isOut ? 'disabled' : ''}>
                            <i class="fa-solid fa-plus"></i> Add to Tray
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    },

    // ==========================================
    // Cart Functionality
    // ==========================================
    addToCart(productId) {
        const product = this.state.products.find(p => p._id === productId);
        if (!product || product.isOutOfStock) return;

        const existingItem = this.state.cart.find(item => item._id === productId);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.state.cart.push({
                _id: product._id,
                name: product.name,
                price: product.price,
                img: product.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=60',
                quantity: 1
            });
        }

        this.renderCart();
    },

    updateQuantity(productId, delta) {
        const itemIndex = this.state.cart.findIndex(i => i._id === productId);
        if (itemIndex > -1) {
            this.state.cart[itemIndex].quantity += delta;

            if (this.state.cart[itemIndex].quantity <= 0) {
                this.state.cart.splice(itemIndex, 1);
            }

            this.renderCart();
        }
    },

    removeFromCart(productId) {
        this.state.cart = this.state.cart.filter(item => item._id !== productId);
        this.renderCart();
    },

    clearCart() {
        this.state.cart = [];
        this.renderCart();
    },

    renderCart() {
        const totalItems = this.state.cart.reduce((sum, item) => sum + item.quantity, 0);
        const totalAmount = this.state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // Update header & footer
        this.cartCount.textContent = `${totalItems} item${totalItems !== 1 ? 's' : ''}`;
        this.cartTotalAmount.textContent = this.formatCurrency(totalAmount);

        if (this.mobileCartBadge) {
            this.mobileCartBadge.textContent = totalItems;
        }

        // Toggle Checkout Button
        this.checkoutBtn.disabled = this.state.cart.length === 0;

        if (this.state.cart.length === 0) {
            this.cartItemsContainer.innerHTML = `
                <div class="empty-cart text-center text-muted mt-5 fade-in">
                    <i class="fa-solid fa-tray fa-3x mb-3 text-gold"></i>
                    <p>Your tray is empty.<br>Add some delicious food!</p>
                </div>
            `;
            return;
        }

        this.cartItemsContainer.innerHTML = this.state.cart.map(item => `
            <div class="cart-item">
                <img src="${item.img}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">${this.formatCurrency(item.price)}</div>
                    <div class="cart-item-controls">
                        <button class="qty-btn" onclick="kioskApp.updateQuantity('${item._id}', -1)"><i class="fa-solid fa-minus" style="font-size: 0.6rem;"></i></button>
                        <span class="qty-input">${item.quantity}</span>
                        <button class="qty-btn" onclick="kioskApp.updateQuantity('${item._id}', 1)"><i class="fa-solid fa-plus" style="font-size: 0.6rem;"></i></button>
                        <button class="remove-btn" onclick="kioskApp.removeFromCart('${item._id}')"><i class="fa-solid fa-trash-can"></i></button>
                    </div>
                </div>
            </div>
        `).join('');
    },

    // ==========================================
    // Checkout Process
    // ==========================================
    async handleCheckout() {
        if (!this.state.user || this.state.cart.length === 0) return;

        this.checkoutBtn.disabled = true;
        this.checkoutBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';

        try {
            // Format for backend
            const items = this.state.cart.map(item => ({
                product: item._id,
                quantity: item.quantity,
                price: item.price
            }));

            const totalAmount = this.state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            const reqBody = {
                userId: this.state.user._id,
                items,
                totalAmount,
                stallName: this.state.stallName
            };

            const res = await fetch(`${window.config.apiUrl}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reqBody)
            });

            if (!res.ok) throw new Error('Order submission failed');

            const orderData = await res.json();

            this.showOrderSuccess(orderData._id);

        } catch (error) {
            console.error('Checkout error:', error);
            showToast("Failed to submit order. Please try again.", "error");
            this.checkoutBtn.disabled = false;
            this.checkoutBtn.innerHTML = 'Proceed to Checkout <i class="fa-solid fa-chevron-right"></i>';
        }
    },

    showOrderSuccess(orderId) {
        // Just show last 4 chars for quick readable ID
        const shortId = orderId.substring(orderId.length - 4).toUpperCase();
        this.displayOrderId.textContent = `#${shortId}`;
        this.orderModal.classList.remove('hidden');

        // Reset button state
        this.checkoutBtn.disabled = true; // Still disabled if modal opens (cart is clear essentially now)
        this.checkoutBtn.innerHTML = 'Proceed to Checkout <i class="fa-solid fa-chevron-right"></i>';
    },

    // ==========================================
    // Feedback System
    // ==========================================
    highlightStars(rating) {
        this.stars.forEach(star => {
            if (star.dataset.rating <= rating) {
                star.classList.add('selected');
            } else {
                star.classList.remove('selected');
            }
        });
    },

    resetFeedbackForm() {
        this.ratingInput.value = 0;
        this.highlightStars(0);
        this.feedbackComment.value = '';
    },

    async handleFeedbackSubmit(e) {
        e.preventDefault();

        const rating = parseInt(this.ratingInput.value);
        const comment = this.feedbackComment.value.trim();

        if (rating === 0) {
            showToast('Please select a star rating.', 'warning');
            return;
        }

        this.submitFeedbackBtn.disabled = true;
        this.submitFeedbackBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting...';

        try {
            const reqBody = {
                userId: this.state.user._id,
                rating,
                comment,
                stallName: this.state.stallName, // specific stall feedback
                productId: null // General kiosk feedback
            };

            const res = await fetch(`${window.config.apiUrl}/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reqBody)
            });

            if (!res.ok) throw new Error('Feedback submission failed');

            showToast('Thank you for your feedback! 🌟', 'success');

            this.feedbackModal.classList.add('hidden');
            this.resetFeedbackForm();

        } catch (error) {
            console.error('Feedback error:', error);
            showToast('Failed to submit feedback. Please try again.', 'error');
        } finally {
            this.submitFeedbackBtn.disabled = false;
            this.submitFeedbackBtn.innerHTML = 'Submit Feedback';
        }
    }
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    kioskApp.init();
});
