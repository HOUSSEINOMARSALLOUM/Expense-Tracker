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
