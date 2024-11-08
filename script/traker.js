// API configuration
const API_URL = "http://localhost/expense-tracker/api.php";
let currentUser = null;

// Auth functions
async function login(username, password) {
  try {
    const response = await axios.post(`${API_URL}/auth`, {
      action: "login",
      username,
      password,
    });
    currentUser = response.data;
    localStorage.setItem("user", JSON.stringify(currentUser));
    showApp();
    loadTransactions();
  } catch (error) {
    alert(error.response?.data?.error || "Login failed");
  }
}

async function register(username, email, password) {
  try {
    await axios.post(`${API_URL}/auth`, {
      action: "register",
      username,
      email,
      password,
    });
    alert("Registration successful! Please login.");
    // Switch to login tab
    document.querySelector('[href="#login"]').click();
  } catch (error) {
    alert(error.response?.data?.error || "Registration failed");
  }
}

// Transaction functions
async function loadTransactions() {
  try {
    const response = await axios.get(`${API_URL}/transactions`, {
      params: { user_id: currentUser.id },
    });
    updateTransactionsTable(response.data);
    updateTotals(response.data);
  } catch (error) {
    alert("Failed to load transactions");
  }
}

async function addTransaction(transactionData) {
  try {
    await axios.post(`${API_URL}/transactions`, {
      ...transactionData,
      user_id: currentUser.id,
    });
    loadTransactions();
  } catch (error) {
    alert("Failed to add transaction");
  }
}

async function updateTransaction(id, transactionData) {
  try {
    await axios.put(`${API_URL}/transactions`, {
      ...transactionData,
      id,
      user_id: currentUser.id,
    });
    loadTransactions();
  } catch (error) {
    alert("Failed to update transaction");
  }
}

async function deleteTransaction(id) {
  try {
    await axios.delete(`${API_URL}/transactions`, {
      params: { id, user_id: currentUser.id },
    });
    loadTransactions();
  } catch (error) {
    alert("Failed to delete transaction");
  }
}

// UI functions
function showApp() {
  document.getElementById("auth-section").classList.add("d-none");
  document.getElementById("app-section").classList.remove("d-none");
}

function updateTransactionsTable(transactions) {
  const tableBody = document.getElementById("transactions-table");
  tableBody.innerHTML = transactions
    .map(
      (t) => `
      <tr>
          <td>${new Date(t.date).toLocaleDateString()}</td>
          <td>
              <span class="badge bg-${
                t.type === "income" ? "success" : "danger"
              }">
                  ${t.type}
              </span>
          </td>
          <td>$${parseFloat(t.amount).toFixed(2)}</td>
          <td>${t.notes || "-"}</td>
          <td>
              <button class="btn btn-sm btn-primary edit-btn" data-id="${
                t.id
              }">Edit</button>
              <button class="btn btn-sm btn-danger delete-btn" data-id="${
                t.id
              }">Delete</button>
          </td>
      </tr>
  `
    )
    .join("");
}

function updateTotals(transactions) {
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const totalBalance = totalIncome - totalExpenses;

  document.getElementById("total-income").textContent = totalIncome.toFixed(2);
  document.getElementById("total-expenses").textContent =
    totalExpenses.toFixed(2);
  document.getElementById("total-balance").textContent =
    totalBalance.toFixed(2);
}
