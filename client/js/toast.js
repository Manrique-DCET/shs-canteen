/**
 * Global Toast Notification System
 * Usage: showToast('Your message here', 'success|error|warning|info', 'Custom Title');
 */

// Inject Container on Load
document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('toast-container')) {
        const container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
});

window.showToast = function (message, type = 'info', customTitle = null) {
    const container = document.getElementById('toast-container');
    if (!container) return; // Failsafe

    // Determine Icon & Title based on type
    let iconClass = 'fa-info-circle';
    let defaultTitle = 'Information';

    switch (type) {
        case 'success':
            iconClass = 'fa-check-circle';
            defaultTitle = 'Success';
            break;
        case 'error':
            iconClass = 'fa-exclamation-circle';
            defaultTitle = 'Error';
            break;
        case 'warning':
            iconClass = 'fa-exclamation-triangle';
            defaultTitle = 'Warning';
            break;
        case 'info':
        default:
            iconClass = 'fa-info-circle';
            defaultTitle = 'Information';
            break;
    }

    const title = customTitle || defaultTitle;
    const durationMs = 4000;

    // Create Toast Element
    const toastElem = document.createElement('div');
    toastElem.className = `toast toast-${type}`;

    toastElem.innerHTML = `
        <div class="toast-icon">
            <i class="fa-solid ${iconClass}"></i>
        </div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close"><i class="fa-solid fa-xmark"></i></button>
        <div class="toast-progress" style="animation-duration: ${durationMs}ms;"></div>
    `;

    // Add to container
    container.appendChild(toastElem);

    // Animate in
    setTimeout(() => {
        toastElem.classList.add('show');
    }, 10);

    // Setup close button
    const closeBtn = toastElem.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => removeToast(toastElem));

    // Auto remove after duration
    setTimeout(() => {
        removeToast(toastElem);
    }, durationMs);
};

function removeToast(toastElem) {
    if (toastElem.classList.contains('removing')) return;

    toastElem.classList.add('removing');
    toastElem.classList.remove('show');

    // Wait for transition to finish before removing from DOM
    setTimeout(() => {
        if (toastElem.parentNode) {
            toastElem.parentNode.removeChild(toastElem);
        }
    }, 400); // 400ms matches CSS transition
}
