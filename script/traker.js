// Initialize Modal
document.addEventListener("DOMContentLoaded", () => {
  const editModal = new bootstrap.Modal(document.getElementById("editModal"));
  const manager = new TransactionManager();

  // Form submission handler for new transactions
  document
    .getElementById("transaction-form")
    .addEventListener("submit", (e) => {
      e.preventDefault();

      const amountInput = document.getElementById("amount");

      if (
        !amountInput.value ||
        isNaN(amountInput.value) ||
        parseFloat(amountInput.value) <= 0
      ) {
        alert("Please enter a valid amount.");
        return;
      }

      const transaction = new Transaction(
        amountInput.value,
        document.getElementById("type").value,
        document.getElementById("date").value,
        document.getElementById("notes").value.trim()
      );

      manager.addTransaction(transaction);
      e.target.reset();
    });

  // Add default date to the date input
  document.getElementById("date").valueAsDate = new Date();
});

// Transaction class
class Transaction {
  constructor(amount, type, date, notes) {
    this.id = Date.now().toString(); // Unique ID based on timestamp
    this.amount = parseFloat(amount);
    this.type = type;
    this.date = new Date(date).toISOString();
    this.notes = notes || "";
  }
}

// TransactionManager class
class TransactionManager {
  constructor() {
    try {
      this.transactions =
        JSON.parse(localStorage.getItem("transactions")) || [];
    } catch (error) {
      console.error("Failed to parse transactions from localStorage:", error);
      this.transactions = [];
    }
    this.currentFilters = {};
    console.log("Initial transactions:", this.transactions); // Debug log
    this.updateUI(); // Initial UI update
  }

  addTransaction(transaction) {
    this.transactions.push(transaction);
    console.log("Added transaction:", transaction); // Debug log
    this.saveToLocalStorage();
    this.updateUI();
  }

  saveToLocalStorage() {
    localStorage.setItem("transactions", JSON.stringify(this.transactions));
  }

  getFilteredTransactions() {
    return this.transactions; // For now, return all transactions
  }

  updateUI() {
    const filteredTransactions = this.getFilteredTransactions();
    const tableBody = document.getElementById("transactions-table");
    const noTransactionsDiv = document.getElementById("no-transactions");

    // Clear table body
    tableBody.innerHTML = "";

    if (filteredTransactions.length === 0) {
      noTransactionsDiv.classList.remove("d-none");
      return;
    } else {
      noTransactionsDiv.classList.add("d-none");
    }

    // Create rows for transactions
    filteredTransactions.forEach((t) => {
      const row = document.createElement("tr");
      row.innerHTML = `
                <td>${new Date(t.date).toLocaleDateString()}</td>
                <td><span class="badge bg-${
                  t.type === "income" ? "success" : "danger"
                } text-white">${
        t.type.charAt(0).toUpperCase() + t.type.slice(1)
      }</span></td>
                <td class="text-${
                  t.type === "income" ? "success" : "danger"
                }">$${t.amount.toFixed(2)}</td>
                <td>${t.notes || "-"}</td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary edit-btn" data-id="${
                          t.id
                        }">Edit</button>
                        <button class="btn btn-outline-danger delete-btn" data-id="${
                          t.id
                        }">Delete</button>
                    </div>
                </td>`;
      tableBody.appendChild(row);
    });

    // Update totals
    this.updateTotals();

    // Add event listeners to new buttons
    this.bindButtonEvents();
  }

  updateTotals() {
    const totalIncome = this.transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = this.transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    document.getElementById("total-income").textContent =
      totalIncome.toFixed(2);
    document.getElementById("total-expenses").textContent =
      totalExpenses.toFixed(2);
    document.getElementById("total-balance").textContent = (
      totalIncome - totalExpenses
    ).toFixed(2);
  }

  bindButtonEvents() {
    document
      .querySelectorAll(".edit-btn")
      .forEach((btn) =>
        btn.addEventListener("click", this.handleEdit.bind(this))
      );
    document
      .querySelectorAll(".delete-btn")
      .forEach((btn) =>
        btn.addEventListener("click", this.handleDelete.bind(this))
      );
  }

  handleEdit(e) {
    const id = e.target.dataset.id;
    const transaction = this.transactions.find((t) => t.id === id);

    if (transaction) {
      document.getElementById("edit-id").value = id;
      document.getElementById("edit-amount").value = transaction.amount;
      document.getElementById("edit-type").value = transaction.type;
      document.getElementById("edit-date").value =
        transaction.date.split("T")[0]; // Format date for input
      document.getElementById("edit-notes").value = transaction.notes || "";
      editModal.show();
    }
  }

  handleDelete(e) {
    if (confirm("Are you sure you want to delete this transaction?")) {
      const id = e.target.dataset.id;
      this.deleteTransaction(id);
    }
  }

  deleteTransaction(id) {
    this.transactions = this.transactions.filter((t) => t.id !== id);
    this.saveToLocalStorage();
    this.updateUI();
    console.log(`Deleted transaction with id: ${id}`); // Debug log
  }

  applyFilters(filters) {
    this.currentFilters = filters;
    this.updateUI();
  }
}
