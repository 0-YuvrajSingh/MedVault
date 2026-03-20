/**
 * Simple toast notification utility
 */

let toastContainer = null;

const createToastContainer = () => {
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "toast-container";
    toastContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
    `;
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
};

export const toast = {
  success: (message) => showToastInternal(message, "success"),
  error: (message) => showToastInternal(message, "error"),
  info: (message) => showToastInternal(message, "info"),
};

// Export showToast for backward compatibility
export const showToast = toast;

const showToastInternal = (message, type = "info") => {
  const container = createToastContainer();

  const toastEl = document.createElement("div");
  toastEl.textContent = message;

  const colors = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
  };

  toastEl.className = `${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in`;
  toastEl.style.cssText = `
    min-width: 200px;
    max-width: 400px;
    animation: slideIn 0.3s ease-out;
  `;

  container.appendChild(toastEl);

  setTimeout(() => {
    toastEl.style.animation = "slideOut 0.3s ease-out";
    setTimeout(() => {
      container.removeChild(toastEl);
    }, 300);
  }, 3000);
};
