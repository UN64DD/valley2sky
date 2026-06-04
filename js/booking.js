/* ============================================
   Valley2Sky Paragliding - Booking Page Logic
   Handles form validation, submission, and confirmation
   ============================================ */

/* ---- Packages data ---- */

var packages = [
  { name: 'Basic Flight', price: 150 },
  { name: 'Premium Flight', price: 250 },
  { name: 'Sunset Flight', price: 300 }
];

/* ---- Available time slots ---- */

var timeSlots = [
  '09:00 AM', '10:00 AM', '11:00 AM',
  '02:00 PM', '03:00 PM', '04:00 PM',
  '05:00 PM', '06:00 PM'
];

/* ---- DOM Ready ---- */

document.addEventListener('DOMContentLoaded', function () {
  populatePackageOptions();
  populateTimeSlots();
  setMinDate();
  preSelectPackage();

  var form = document.getElementById('bookingForm');
  if (form) {
    form.addEventListener('submit', handleFormSubmit);
  }
});

/* ---- Pre-select package from URL param ---- */

function preSelectPackage() {
  var params = new URLSearchParams(window.location.search);
  var pkg = params.get('package');
  if (pkg) {
    var select = document.getElementById('flightPackage');
    if (select) {
      select.value = pkg;
    }
  }
}

/* ---- Populate package dropdown ---- */

function populatePackageOptions() {
  var select = document.getElementById('flightPackage');
  if (!select) return;

  packages.forEach(function (pkg) {
    var option = document.createElement('option');
    option.value = pkg.name;
    option.textContent = pkg.name + ' - RM' + pkg.price;
    select.appendChild(option);
  });
}

/* ---- Populate time slot dropdown ---- */

function populateTimeSlots() {
  var select = document.getElementById('timeSlot');
  if (!select) return;

  timeSlots.forEach(function (slot) {
    var option = document.createElement('option');
    option.value = slot;
    option.textContent = slot;
    select.appendChild(option);
  });
}

/* ---- Set min date to today ---- */

function setMinDate() {
  var dateInput = document.getElementById('flightDate');
  if (!dateInput) return;

  var today = new Date();
  var year = today.getFullYear();
  var month = String(today.getMonth() + 1).padStart(2, '0');
  var day = String(today.getDate()).padStart(2, '0');
  dateInput.setAttribute('min', year + '-' + month + '-' + day);
}

/* ---- Show field error ---- */

function showFieldError(fieldId, message) {
  var field = document.getElementById(fieldId);
  var errorEl = document.getElementById(fieldId + 'Error');
  if (field) field.classList.add('error');
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.add('visible');
  }
}

/* ---- Clear field error ---- */

function clearFieldError(fieldId) {
  var field = document.getElementById(fieldId);
  var errorEl = document.getElementById(fieldId + 'Error');
  if (field) field.classList.remove('error');
  if (errorEl) {
    errorEl.textContent = '';
    errorEl.classList.remove('visible');
  }
}

/* ---- Validate form ---- */

function validateForm(formData) {
  var errors = [];
  clearFieldError('fullName');
  clearFieldError('phone');
  clearFieldError('email');
  clearFieldError('flightPackage');
  clearFieldError('flightDate');
  clearFieldError('timeSlot');

  if (!formData.name.trim()) {
    errors.push({ field: 'fullName', message: 'Full name is required.' });
  }

  if (!formData.phone.trim()) {
    errors.push({ field: 'phone', message: 'Phone number is required.' });
  } else if (!isValidPhone(formData.phone)) {
    errors.push({ field: 'phone', message: 'Enter a valid Malaysian phone number (e.g. 0123456789).' });
  }

  if (!formData.email.trim()) {
    errors.push({ field: 'email', message: 'Email address is required.' });
  } else if (!isValidEmail(formData.email)) {
    errors.push({ field: 'email', message: 'Enter a valid email address.' });
  }

  if (!formData.package) {
    errors.push({ field: 'flightPackage', message: 'Please select a flight package.' });
  }

  if (!formData.date) {
    errors.push({ field: 'flightDate', message: 'Please select a flight date.' });
  } else {
    var selectedDate = new Date(formData.date + 'T00:00:00');
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      errors.push({ field: 'flightDate', message: 'Flight date cannot be in the past.' });
    }
  }

  if (!formData.time) {
    errors.push({ field: 'timeSlot', message: 'Please select a time slot.' });
  } else if (formData.date && formData.time) {
    if (isDuplicateBooking(formData.date, formData.time)) {
      errors.push({
        field: 'timeSlot',
        message: 'This time slot is already booked for the selected date. Please choose another.'
      });
    }
  }

  errors.forEach(function (err) {
    showFieldError(err.field, err.message);
  });

  return errors.length === 0;
}

/* ---- Handle form submission ---- */

function handleFormSubmit(e) {
  e.preventDefault();

  var formData = {
    name: document.getElementById('fullName').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    email: document.getElementById('email').value.trim(),
    package: document.getElementById('flightPackage').value,
    date: document.getElementById('flightDate').value,
    time: document.getElementById('timeSlot').value,
    notes: document.getElementById('notes').value.trim()
  };

  if (!validateForm(formData)) return;

  var booking = {
    id: getNextId(),
    name: formData.name,
    phone: formData.phone,
    email: formData.email,
    package: formData.package,
    date: formData.date,
    time: formData.time,
    notes: formData.notes,
    status: 'Pending',
    createdAt: new Date().toISOString()
  };

  var bookings = getBookings();
  bookings.push(booking);
  saveBookings(bookings);

  showConfirmation(booking);
  showNotification('Booking successful! Your ID is ' + booking.id, 'success');

  document.getElementById('bookingForm').reset();
}

/* ---- Display confirmation ---- */

function showConfirmation(booking) {
  var form = document.getElementById('bookingForm');
  var confirmation = document.getElementById('confirmation');

  if (form) form.style.display = 'none';
  if (confirmation) {
    confirmation.style.display = 'block';

    var pkg = packages.find(function (p) { return p.name === booking.package; });
    var price = pkg ? 'RM' + pkg.price : '';

    document.getElementById('confirmId').textContent = booking.id;
    document.getElementById('confirmName').textContent = booking.name;
    document.getElementById('confirmPhone').textContent = booking.phone;
    document.getElementById('confirmEmail').textContent = booking.email;
    document.getElementById('confirmPackage').textContent = booking.package + (price ? ' (' + price + ')' : '');
    document.getElementById('confirmDate').textContent = booking.date;
    document.getElementById('confirmTime').textContent = booking.time;
    document.getElementById('confirmStatus').textContent = booking.status;
  }
}

/* ---- Book another flight ---- */

function bookAnother() {
  var form = document.getElementById('bookingForm');
  var confirmation = document.getElementById('confirmation');

  if (form) form.style.display = 'block';
  if (confirmation) confirmation.style.display = 'none';
}
