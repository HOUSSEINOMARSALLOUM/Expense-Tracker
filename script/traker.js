// Initialize Modal
const editModal = new bootstrap.Modal(document.getElementById("editModal"));

class TransactionManager {
  constructor() {
    this.transactions = JSON.parse(localStorage.getItem("transactions")) || [];
    this.currentFilters = {};
    console.log("Initial transactions:", this.transactions); // Debug log
  }

  addTransaction(transaction) {
    transaction.id = Date.now().toString();
    this.transactions.push(transaction);
    console.log("Added transaction:", transaction); // Debug log
    this.saveToLocalStorage();
    this.updateUI();
  }

  