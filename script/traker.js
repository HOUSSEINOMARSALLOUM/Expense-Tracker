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
