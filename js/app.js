/* ============================================
   Valley2Sky Paragliding - Shared Application Logic
   Handles Local Storage, navigation, and common utilities
   ============================================ */

const STORAGE_KEY = 'valley2skyBookings';

/* ---- Local Storage Helpers ---- */

function getBookings() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function saveBookings(bookings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
}

function getNextId() {
  const bookings = getBookings();
  const maxNum = bookings.reduce((max, b) => {
    const num = parseInt(b.id.replace('V2S-', ''), 10);
    return num > max ? num : max;
  }, 0);
  return 'V2S-' + String(maxNum + 1).padStart(3, '0');
}

/* ---- Notification System ---- */

function showNotification(message, type) {
  const container = document.getElementById('notificationContainer');
  if (!container) return;

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ'
  };

  const notification = document.createElement('div');
  notification.className = 'notification ' + type;
  notification.innerHTML = '<span>' + (icons[type] || 'ℹ') + '</span>' + message;
  container.appendChild(notification);

  setTimeout(function () {
    notification.style.opacity = '0';
    notification.style.transition = 'opacity 0.3s ease';
    setTimeout(function () {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3500);
}

/* ---- Mobile Navigation Toggle ---- */

document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('.mobile-toggle');
  var links = document.querySelector('.navbar-links');

  if (toggle && links) {
    toggle.addEventListener('click', function () {
      links.classList.toggle('open');
    });

    document.addEventListener('click', function (e) {
      if (!toggle.contains(e.target) && !links.contains(e.target)) {
        links.classList.remove('open');
      }
    });
  }
});

/* ---- Validate Email ---- */

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ---- Validate Phone (Malaysia format: 01X-XXXXXXXX) ---- */

function isValidPhone(phone) {
  return /^01[0-9]{7,9}$/.test(phone.replace(/[\s\-]/g, ''));
}

/* ---- Check for duplicate booking ---- */

function isDuplicateBooking(date, time) {
  const bookings = getBookings();
  return bookings.some(function (b) {
    return b.date === date && b.time === time;
  });
}
