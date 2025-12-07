// Admin credentials
const ADMIN_ID = "97903";
const ADMIN_PASSCODE = "08042007";
const ADMIN_EMAIL = "nsrbpt@gmail.com";

// Simulated database
if (!localStorage.getItem("students")) {
  localStorage.setItem("students", JSON.stringify([]));
}
if (!localStorage.getItem("tickets")) {
  localStorage.setItem("tickets", JSON.stringify([]));
}
if (!localStorage.getItem("passwordResetRequests")) {
  localStorage.setItem("passwordResetRequests", JSON.stringify([]));
}

// Forgot Password Functions
function initForgotPassword(role) {
  document.getElementById('forgotPasswordModal').style.display = 'flex';
  document.getElementById('fpRole').value = role;
  document.getElementById('fpRequestForm').style.display = 'block';
  document.getElementById('fpResetForm').style.display = 'none';

  // Reset fields
  document.getElementById('fpInput').value = '';
  document.getElementById('fpNewPassword').value = '';
  document.getElementById('fpConfirmPassword').value = '';

  // Update UI based on role
  const title = document.getElementById('fpModalTitle');
  const subtitle = document.getElementById('fpModalSubtitle');
  const inputLabel = document.getElementById('fpInputLabel');
  const input = document.getElementById('fpInput');

  if (role === 'student') {
    title.textContent = 'Student Password Reset';
    inputLabel.innerHTML = '<span class="material-icons">badge</span> Roll Number';
    input.placeholder = 'Enter your Roll Number';
  } else {
    title.textContent = 'Parent Password Reset';
    inputLabel.innerHTML = '<span class="material-icons">phone</span> Mobile Number';
    input.placeholder = 'Enter your Mobile Number';
  }
}

function closeForgotPasswordModal() {
  document.getElementById('forgotPasswordModal').style.display = 'none';
}

function submitPasswordRequest(event) {
  event.preventDefault();
  const role = document.getElementById('fpRole').value;
  const id = document.getElementById('fpInput').value;

  // Verify user exists
  const students = JSON.parse(localStorage.getItem("students"));
  let userExists = false;

  if (role === 'student') {
    userExists = students.some(s => s.rollNo === id);
  } else {
    userExists = students.some(s => s.parentMobile === id);
  }

  if (!userExists) {
    showNotification('Error', 'User not found!', 'error');
    return;
  }

  const requests = JSON.parse(localStorage.getItem("passwordResetRequests"));
  const existingRequest = requests.find(r => r.id === id && r.role === role);

  if (existingRequest) {
    if (existingRequest.status === 'Approved') {
      // Show reset form
      document.getElementById('fpRequestForm').style.display = 'none';
      document.getElementById('fpResetForm').style.display = 'block';
      document.getElementById('fpResetId').value = id;
      showNotification('Success', 'Request Approved! Set your new password.', 'success');
    } else {
      showNotification('Info', 'Request is pending admin approval.', 'info');
    }
  } else {
    // Create new request
    requests.push({
      id: id,
      role: role,
      status: 'Pending',
      timestamp: new Date().toISOString()
    });
    localStorage.setItem("passwordResetRequests", JSON.stringify(requests));
    showNotification('Success', 'Request sent to Admin!', 'success');
    closeForgotPasswordModal();
  }
}

function submitNewPassword(event) {
  event.preventDefault();
  const role = document.getElementById('fpRole').value;
  const id = document.getElementById('fpResetId').value;
  const newPass = document.getElementById('fpNewPassword').value;
  const confirmPass = document.getElementById('fpConfirmPassword').value;

  if (newPass !== confirmPass) {
    showNotification('Error', 'Passwords do not match!', 'error');
    return;
  }

  const students = JSON.parse(localStorage.getItem("students"));
  const studentIndex = students.findIndex(s => role === 'student' ? s.rollNo === id : s.parentMobile === id);

  if (studentIndex !== -1) {
    if (role === 'student') {
      students[studentIndex].password = newPass;
    } else {
      students[studentIndex].parentPassword = newPass;
    }
    localStorage.setItem("students", JSON.stringify(students));

    // Remove request
    const requests = JSON.parse(localStorage.getItem("passwordResetRequests"));
    const newRequests = requests.filter(r => !(r.id === id && r.role === role));
    localStorage.setItem("passwordResetRequests", JSON.stringify(newRequests));

    showNotification('Success', 'Password updated successfully! Please login.', 'success');
    closeForgotPasswordModal();
  }
}

function viewPasswordRequests() {
  document.getElementById("studentTable").style.display = "none";
  document.getElementById("ticketTable").style.display = "none";
  const tableContainer = document.getElementById("passwordRequestTable");
  tableContainer.style.display = "block";

  tableContainer.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>ID/Mobile</th>
          <th>Role</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody id="passwordRequestTableBody"></tbody>
    </table>
  `;

  const requests = JSON.parse(localStorage.getItem("passwordResetRequests"));
  const tableBody = document.getElementById("passwordRequestTableBody");

  if (requests.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No pending requests</td></tr>';
    return;
  }

  requests.forEach((req, index) => {
    tableBody.innerHTML += `
      <tr>
        <td>${req.id}</td>
        <td>${req.role}</td>
        <td><span class="status-badge ${req.status.toLowerCase()}">${req.status}</span></td>
        <td>
          ${req.status === 'Pending' ?
        `<button class="btn btn-success" onclick="approvePasswordRequest(${index})">Approve</button>` :
        'Approved'}
        </td>
      </tr>
    `;
  });
}

function approvePasswordRequest(index) {
  const requests = JSON.parse(localStorage.getItem("passwordResetRequests"));
  requests[index].status = 'Approved';
  localStorage.setItem("passwordResetRequests", JSON.stringify(requests));
  showNotification('Success', 'Request Approved!', 'success');
  viewPasswordRequests();
}

// Notification System - Replace all alerts
function showNotification(title, message, type = 'info') {
  const toast = document.getElementById('notificationToast');
  const icon = document.getElementById('notificationIcon');
  const titleEl = document.getElementById('notificationTitle');
  const messageEl = document.getElementById('notificationMessage');

  // Set content
  titleEl.textContent = title;
  messageEl.textContent = message;

  // Set type and icon
  toast.className = 'notification-toast show ' + type;
  if (type === 'error') {
    icon.textContent = 'error';
  } else if (type === 'success') {
    icon.textContent = 'check_circle';
  } else {
    icon.textContent = 'info';
  }

  // Auto hide after 4 seconds
  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}

// Show/Hide Login Forms
function showLoginForm(role) {
  document.getElementById('loginCard').style.display = 'none';
  document.getElementById('studentLoginForm').style.display = 'none';
  document.getElementById('parentLoginForm').style.display = 'none';
  document.getElementById('adminLoginForm').style.display = 'none';

  if (role === 'student') {
    document.getElementById('studentLoginForm').style.display = 'block';
  } else if (role === 'parent') {
    document.getElementById('parentLoginForm').style.display = 'block';
  } else if (role === 'admin') {
    document.getElementById('adminLoginForm').style.display = 'block';
  }
}

function hideLoginForm() {
  document.getElementById('studentLoginForm').style.display = 'none';
  document.getElementById('parentLoginForm').style.display = 'none';
  document.getElementById('adminLoginForm').style.display = 'none';
  document.getElementById('loginCard').style.display = 'block';
}

// Login Functions
function loginStudent(event) {
  event.preventDefault();
  const rollNo = document.getElementById('studentRollNo').value;
  const password = document.getElementById('studentPassword').value;

  const students = JSON.parse(localStorage.getItem("students"));
  const student = students.find(s => s.rollNo === rollNo);

  if (student && student.password === password) {
    localStorage.setItem("currentUser", JSON.stringify({ role: "student", rollNo }));
    window.location.href = "student.html";
  } else {
    showNotification('Login Failed', 'Invalid Roll Number or Password!', 'error');
  }
}

function loginParent(event) {
  event.preventDefault();
  const mobile = document.getElementById('parentMobile').value;
  const password = document.getElementById('parentPassword').value;

  const students = JSON.parse(localStorage.getItem("students"));
  const student = students.find(s => s.parentMobile === mobile);

  if (student && student.parentPassword === password) {
    localStorage.setItem("currentUser", JSON.stringify({ role: "parent", mobile }));
    window.location.href = "parent.html";
  } else {
    showNotification('Login Failed', 'Invalid Mobile Number or Password!', 'error');
  }
}

function loginAdmin(event) {
  event.preventDefault();
  const adminId = document.getElementById('adminId').value;
  const passcode = document.getElementById('adminPasscode').value;

  if (adminId === ADMIN_ID && passcode === ADMIN_PASSCODE) {
    window.location.href = "admin.html";
  } else {
    showNotification('Login Failed', 'Invalid Admin ID or Passcode!', 'error');
  }
}


// Admin functions
function addStudent() {
  document.getElementById('addStudentModal').style.display = 'flex';
}

function closeAddStudentForm() {
  document.getElementById('addStudentModal').style.display = 'none';
  // Reset form
  document.querySelector('#addStudentModal form').reset();
}

function submitAddStudent(event) {
  event.preventDefault();

  const students = JSON.parse(localStorage.getItem("students"));
  students.push({
    name: document.getElementById('studentName').value,
    rollNo: document.getElementById('rollNumber').value,
    dateOfBirth: document.getElementById('dateOfBirth').value,
    mobile: document.getElementById('studentMobile').value,
    branch: document.getElementById('branch').value,
    degree: document.getElementById('degreeType').value,
    cgpa: document.getElementById('cgpa').value,
    club: document.getElementById('club').value,
    fatherName: document.getElementById('fatherName').value,
    motherName: document.getElementById('motherName').value,
    parentMobile: document.getElementById('parentMobile').value,
    password: document.getElementById('studentDefaultPassword').value,
    parentPassword: document.getElementById('parentDefaultPassword').value,
  });

  localStorage.setItem("students", JSON.stringify(students));
  closeAddStudentForm();
  showNotification('Success', 'Student added successfully!', 'success');
  viewStudents();
}

function viewStudents() {
  document.getElementById("ticketTable").style.display = "none";
  document.getElementById("passwordRequestTable").style.display = "none";
  const tableContainer = document.getElementById("studentTable");
  tableContainer.style.display = "block";
  tableContainer.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Roll No</th>
          <th>Mobile</th>
          <th>Branch</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody id="studentTableBody"></tbody>
    </table>
  `;

  const students = JSON.parse(localStorage.getItem("students"));
  const tableBody = document.getElementById("studentTableBody");
  students.forEach((student, index) => {
    tableBody.innerHTML += `
      <tr>
        <td>${student.name}</td>
        <td>${student.rollNo}</td>
        <td>${student.mobile}</td>
        <td>${student.branch}</td>
        <td>
          <button class="btn btn-success" onclick="editStudent(${index})">Edit</button>
          <button class="btn btn-danger" onclick="deleteStudent(${index})">Delete</button>
        </td>
      </tr>
    `;
  });
}

function editStudent(index) {
  const students = JSON.parse(localStorage.getItem("students"));
  const student = students[index];

  // Populate the edit form
  document.getElementById('editStudentIndex').value = index;
  document.getElementById('editStudentName').value = student.name;
  document.getElementById('editRollNumber').value = student.rollNo;
  document.getElementById('editDateOfBirth').value = student.dateOfBirth || '';
  document.getElementById('editStudentMobile').value = student.mobile;
  document.getElementById('editBranch').value = student.branch;
  document.getElementById('editDegreeType').value = student.degree;
  document.getElementById('editCgpa').value = student.cgpa;
  document.getElementById('editClub').value = student.club;
  document.getElementById('editFatherName').value = student.fatherName;
  document.getElementById('editMotherName').value = student.motherName;
  document.getElementById('editParentMobile').value = student.parentMobile;

  // Show the modal
  document.getElementById('editStudentModal').style.display = 'flex';
}

function closeEditStudentForm() {
  document.getElementById('editStudentModal').style.display = 'none';
}

function submitEditStudent(event) {
  event.preventDefault();
  const students = JSON.parse(localStorage.getItem("students"));
  const index = parseInt(document.getElementById('editStudentIndex').value);

  students[index] = {
    ...students[index],
    name: document.getElementById('editStudentName').value,
    rollNo: document.getElementById('editRollNumber').value,
    dateOfBirth: document.getElementById('editDateOfBirth').value,
    mobile: document.getElementById('editStudentMobile').value,
    branch: document.getElementById('editBranch').value,
    degree: document.getElementById('editDegreeType').value,
    cgpa: document.getElementById('editCgpa').value,
    club: document.getElementById('editClub').value,
    fatherName: document.getElementById('editFatherName').value,
    motherName: document.getElementById('editMotherName').value,
    parentMobile: document.getElementById('editParentMobile').value
  };

  localStorage.setItem("students", JSON.stringify(students));
  closeEditStudentForm();
  showNotification('Success', 'Student updated successfully!', 'success');
  viewStudents();
}

function deleteStudent(index) {
  // Create a custom confirmation modal would be better, but for now we'll use a simple approach
  const confirmDelete = confirm("Are you sure you want to delete this student?");
  if (confirmDelete) {
    const students = JSON.parse(localStorage.getItem("students"));
    students.splice(index, 1);
    localStorage.setItem("students", JSON.stringify(students));
    showNotification('Success', 'Student deleted successfully!', 'success');
    viewStudents();
  }
}

function viewTickets() {
  document.getElementById("studentTable").style.display = "none";
  document.getElementById("passwordRequestTable").style.display = "none";
  const tableContainer = document.getElementById("ticketTable");
  tableContainer.style.display = "block";
  tableContainer.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Roll No</th>
          <th>Issue</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody id="ticketTableBody"></tbody>
    </table>
  `;

  const tickets = JSON.parse(localStorage.getItem("tickets"));
  const tableBody = document.getElementById("ticketTableBody");
  tickets.forEach((ticket, index) => {
    tableBody.innerHTML += `
      <tr>
        <td>${ticket.rollNo}</td>
        <td>${ticket.issue}</td>
        <td>${ticket.status || "Pending"}</td>
        <td>
          <button class="btn btn-success" onclick="resolveTicket(${index})">Resolve</button>
        </td>
      </tr>
    `;
  });
}

function resolveTicket(index) {
  const tickets = JSON.parse(localStorage.getItem("tickets"));
  tickets[index].status = "Resolved";
  localStorage.setItem("tickets", JSON.stringify(tickets));
  showNotification('Success', 'Ticket resolved successfully!', 'success');
  viewTickets();
}

// Student functions
function loadStudentDetails() {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  const students = JSON.parse(localStorage.getItem("students"));
  const student = students.find(s => s.rollNo === user.rollNo);

  const detailsContainer = document.getElementById("studentDetails");
  detailsContainer.innerHTML = `
    <div class="details-grid">
      <div class="detail-item"><strong>Name</strong><span>${student.name}</span></div>
      <div class="detail-item"><strong>Roll No</strong><span>${student.rollNo}</span></div>
      <div class="detail-item"><strong>Date of Birth</strong><span>${student.dateOfBirth || 'Not Set'}</span></div>
      <div class="detail-item"><strong>Mobile</strong><span>${student.mobile}</span></div>
      <div class="detail-item"><strong>Branch</strong><span>${student.branch}</span></div>
      <div class="detail-item"><strong>Degree</strong><span>${student.degree}</span></div>
      <div class="detail-item"><strong>CGPA</strong><span>${student.cgpa}</span></div>
      <div class="detail-item"><strong>Club</strong><span>${student.club}</span></div>
      <div class="detail-item"><strong>Father's Name</strong><span>${student.fatherName}</span></div>
      <div class="detail-item"><strong>Mother's Name</strong><span>${student.motherName}</span></div>
      <div class="detail-item"><strong>Parent's Mobile</strong><span>${student.parentMobile}</span></div>
    </div>
  `;
}

function raiseTicket() {
  document.getElementById('raiseTicketModal').style.display = 'flex';
}

function closeRaiseTicketForm() {
  document.getElementById('raiseTicketModal').style.display = 'none';
  document.getElementById('ticketIssue').value = '';
}

function submitRaiseTicket(event) {
  event.preventDefault();
  const user = JSON.parse(localStorage.getItem("currentUser"));
  let issue = document.getElementById('ticketIssue').value;
  let rollNo = user.rollNo;

  // Handle Parent Role
  if (user.role === 'parent') {
    const students = JSON.parse(localStorage.getItem("students"));
    const child = students.find(s => s.parentMobile === user.mobile);
    if (child) {
      rollNo = child.rollNo;
      issue += " (Raised by Parent)";
    }
  }

  const tickets = JSON.parse(localStorage.getItem("tickets"));
  tickets.push({
    rollNo: rollNo,
    issue: issue,
    status: "Pending"
  });
  localStorage.setItem("tickets", JSON.stringify(tickets));

  closeRaiseTicketForm();
  showNotification('Success', 'Ticket raised successfully!', 'success');
}

function changePassword() {
  document.getElementById('changePasswordModal').style.display = 'flex';
}

function closeChangePasswordForm() {
  document.getElementById('changePasswordModal').style.display = 'none';
  document.getElementById('currentPassword').value = '';
  document.getElementById('newPassword').value = '';
  document.getElementById('confirmPassword').value = '';
}

function submitChangePassword(event) {
  event.preventDefault();
  const user = JSON.parse(localStorage.getItem("currentUser"));
  const students = JSON.parse(localStorage.getItem("students"));
  const studentIndex = students.findIndex(s => s.rollNo === user.rollNo);

  if (studentIndex !== -1) {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (students[studentIndex].password !== currentPassword) {
      showNotification('Error', 'Current password is incorrect!', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showNotification('Error', 'Passwords do not match!', 'error');
      return;
    }

    students[studentIndex].password = newPassword;
    localStorage.setItem("students", JSON.stringify(students));
    closeChangePasswordForm();
    showNotification('Success', 'Password changed successfully!', 'success');
  }
}


// Parent functions
function loadParentDetails() {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  const students = JSON.parse(localStorage.getItem("students"));
  const child = students.find(s => s.parentMobile === user.mobile);

  const detailsContainer = document.getElementById("childDetails");
  detailsContainer.innerHTML = `
    <div class="details-grid">
      <div class="detail-item"><strong>Name</strong><span>${child.name}</span></div>
      <div class="detail-item"><strong>Roll No</strong><span>${child.rollNo}</span></div>
      <div class="detail-item"><strong>Mobile</strong><span>${child.mobile}</span></div>
      <div class="detail-item"><strong>Branch</strong><span>${child.branch}</span></div>
      <div class="detail-item"><strong>Degree</strong><span>${child.degree}</span></div>
      <div class="detail-item"><strong>CGPA</strong><span>${child.cgpa}</span></div>
    </div>
  `;
}

function payFees() {
  showNotification('Info', 'Redirecting to payment gateway...', 'info');
}

// Chatbox functions
let chatAutoCloseTimer;

function toggleChatbox() {
  const chatbox = document.getElementById('chatbox');
  const toggleBtn = document.getElementById('chatToggleBtn');

  if (chatbox.classList.contains('active')) {
    closeChatbox();
  } else {
    openChatbox();
  }
}

function openChatbox() {
  const chatbox = document.getElementById('chatbox');
  const toggleBtn = document.getElementById('chatToggleBtn');

  chatbox.classList.add('active');
  toggleBtn.style.display = 'none';

  // Auto-close after 7 seconds
  clearTimeout(chatAutoCloseTimer);
  chatAutoCloseTimer = setTimeout(() => {
    closeChatbox();
  }, 7000);
}

function closeChatbox() {
  const chatbox = document.getElementById('chatbox');
  const toggleBtn = document.getElementById('chatToggleBtn');

  chatbox.classList.remove('active');
  toggleBtn.style.display = 'flex';

  clearTimeout(chatAutoCloseTimer);
}

function sendMessage() {
  const messageInput = document.getElementById("chatInput");
  const message = messageInput.value;
  if (message.trim() !== "") {
    const chatMessages = document.getElementById("chatMessages");
    chatMessages.innerHTML += `
      <div class="message">
        <strong>You:</strong> ${message}
      </div>
    `;
    messageInput.value = "";
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Reset auto-close timer when user sends a message
    clearTimeout(chatAutoCloseTimer);
    chatAutoCloseTimer = setTimeout(() => {
      closeChatbox();
    }, 7000);
  }
}

// Initialize dashboards
if (window.location.pathname.endsWith("admin.html")) {
  // viewStudents(); // Disabled auto-load for cleaner experience
}
else if (window.location.pathname.endsWith("student.html")) {
  loadStudentDetails();
}
else if (window.location.pathname.endsWith("parent.html")) {
  loadParentDetails();
}
