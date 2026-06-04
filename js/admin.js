/* ============================================
   Valley2Sky Paragliding - Admin Dashboard Logic
   Handles displaying, managing, searching, and filtering bookings
   ============================================ */

/* ---- DOM Ready ---- */

document.addEventListener('DOMContentLoaded', function () {
  renderDashboard();

  var searchInput = document.getElementById('searchInput');
  var filterSelect = document.getElementById('filterStatus');

  if (searchInput) {
    searchInput.addEventListener('input', renderDashboard);
  }

  if (filterSelect) {
    filterSelect.addEventListener('change', renderDashboard);
  }
});

/* ---- Get filtered bookings ---- */

function getFilteredBookings() {
  var bookings = getBookings();
  var searchTerm = (document.getElementById('searchInput').value || '').toLowerCase().trim();
  var statusFilter = document.getElementById('filterStatus').value;

  return bookings.filter(function (b) {
    var matchesSearch = b.name.toLowerCase().includes(searchTerm);
    var matchesStatus = !statusFilter || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
}

/* ---- Render full dashboard ---- */

function renderDashboard() {
  var allBookings = getBookings();
  var filtered = getFilteredBookings();

  updateStats(allBookings);
  renderTable(filtered);
}

/* ---- Update stats ---- */

function updateStats(bookings) {
  var total = bookings.length;
  var pending = bookings.filter(function (b) { return b.status === 'Pending'; }).length;
  var completed = bookings.filter(function (b) { return b.status === 'Completed'; }).length;

  var totalEl = document.getElementById('statTotal');
  var pendingEl = document.getElementById('statPending');
  var completedEl = document.getElementById('statCompleted');

  if (totalEl) totalEl.textContent = total;
  if (pendingEl) pendingEl.textContent = pending;
  if (completedEl) completedEl.textContent = completed;
}

/* ---- Render bookings table ---- */

function renderTable(bookings) {
  var tbody = document.querySelector('#bookingsTable tbody');
  if (!tbody) return;

  if (bookings.length === 0) {
    tbody.innerHTML = '' +
      '<tr>' +
      '<td colspan="8">' +
      '<div class="empty-state">' +
      '<div class="empty-icon">📋</div>' +
      '<h3>No bookings found</h3>' +
      '<p>There are no bookings to display' + (bookings.length === 0 && getBookings().length > 0 ? ' matching your search.' : '.') + '</p>' +
      '</div>' +
      '</td>' +
      '</tr>';
    return;
  }

  var rows = '';
  bookings.forEach(function (b) {
    rows += '' +
      '<tr>' +
      '<td><strong>' + escapeHtml(b.id) + '</strong></td>' +
      '<td>' + escapeHtml(b.name) + '</td>' +
      '<td>' + escapeHtml(b.phone) + '</td>' +
      '<td>' + escapeHtml(b.package) + '</td>' +
      '<td>' + escapeHtml(b.date) + '</td>' +
      '<td>' + escapeHtml(b.time) + '</td>' +
      '<td><span class="status-badge ' + b.status.toLowerCase() + '">' + b.status + '</span></td>' +
      '<td>' +
      '<div class="action-btns">' +
      (b.status === 'Pending'
        ? '<button class="btn btn-success btn-sm" onclick="markCompleted(\'' + b.id + '\')">✓ Done</button>'
        : '<button class="btn btn-warning btn-sm" onclick="markPending(\'' + b.id + '\')">↻ Pending</button>'
      ) +
      '<button class="btn btn-danger btn-sm" onclick="deleteBooking(\'' + b.id + '\')">✕ Delete</button>' +
      '</div>' +
      '</td>' +
      '</tr>';
  });

  tbody.innerHTML = rows;
}

/* ---- Escape HTML to prevent XSS ---- */

function escapeHtml(text) {
  var div = document.createElement('div');
  div.appendChild(document.createTextNode(text));
  return div.innerHTML;
}

/* ---- Mark booking as completed ---- */

function markCompleted(id) {
  var bookings = getBookings();
  var booking = bookings.find(function (b) { return b.id === id; });
  if (booking) {
    booking.status = 'Completed';
    saveBookings(bookings);
    renderDashboard();
    showNotification('Booking ' + id + ' marked as completed.', 'success');
  }
}

/* ---- Mark booking as pending ---- */

function markPending(id) {
  var bookings = getBookings();
  var booking = bookings.find(function (b) { return b.id === id; });
  if (booking) {
    booking.status = 'Pending';
    saveBookings(bookings);
    renderDashboard();
    showNotification('Booking ' + id + ' marked as pending.', 'info');
  }
}

/* ---- Delete booking ---- */

function deleteBooking(id) {
  if (!confirm('Are you sure you want to delete booking ' + id + '?')) return;

  var bookings = getBookings();
  var filtered = bookings.filter(function (b) { return b.id !== id; });
  saveBookings(filtered);
  renderDashboard();
  showNotification('Booking ' + id + ' has been deleted.', 'error');
}
