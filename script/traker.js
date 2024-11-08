 // Initialize Modal
        const editModal = new bootstrap.Modal(document.getElementById('editModal'));
        
        // Transaction class to manage data and localStorage
        class TransactionManager {
            constructor() {
                this.transactions = JSON.parse(localStorage.getItem('transactions')) || [];
                this.currentFilters = {};
            }

            addTransaction(transaction) {
                transaction.id = Date.now().toString();
                this.transactions.push(transaction);
                this.saveToLocalStorage();
                this.updateUI();
            }

            editTransaction(id, updatedTransaction) {
                const index = this.transactions.findIndex(t => t.id === id);
                if (index !== -1) {
                    this.transactions[index] = { ...updatedTransaction, id };
                    this.saveToLocalStorage();
                    this.updateUI();
                }
            }

            deleteTransaction(id) {
                this.transactions = this.transactions.filter(t => t.id !== id);
                this.saveToLocalStorage();
                this.updateUI();
            }

            saveToLocalStorage() {
                localStorage.setItem('transactions', JSON.stringify(this.transactions));
            }

            getFilteredTransactions() {
                return this.transactions.filter(t => {
                    const matchesMinAmount = !this.currentFilters.minAmount || t.amount >= this.currentFilters.minAmount;
                    const matchesMaxAmount = !this.currentFilters.maxAmount || t.amount <= this.currentFilters.maxAmount;
                    const matchesType = !this.currentFilters.type || t.type === this.currentFilters.type;
                    const matchesDate = !this.currentFilters.date || t.date === this.currentFilters.date;
                    const matchesNotes = !this.currentFilters.notes || 
                        t.notes.toLowerCase().includes(this.currentFilters.notes.toLowerCase());

                    return matchesMinAmount && matchesMaxAmount && matchesType && matchesDate && matchesNotes;
                });
            }

            updateUI() {
                const filteredTransactions = this.getFilteredTransactions();
                
                // Update transactions table
                const tableBody = document.getElementById('transactions-table');
                tableBody.innerHTML = filteredTransactions.map(t => `
                    <tr>
                        <td>${t.date}</td>
                        <td><span class="badge bg-${t.type === 'income' ? 'success' : 'danger'}">${t.type}</span></td>
                        <td>$${t.amount.toFixed(2)}</td>
                        <td>${t.notes}</td>
                        <td>
                            <button class="btn btn-sm btn-primary edit-btn" data-id="${t.id}">Edit</button>
                            <button class="btn btn-sm btn-danger delete-btn" data-id="${t.id}">Delete</button>
                        </td>
                    </tr>
                `).join('');

                // Update totals
                const totalIncome = this.transactions
                    .filter(t => t.type === 'income')
                    .reduce((sum, t) => sum + t.amount, 0);
                
                const totalExpenses = this.transactions
                    .filter(t => t.type === 'expense')
                    .reduce((sum, t) => sum + t.amount, 0);
                
                const totalBalance = totalIncome - totalExpenses;

                document.getElementById('total-income').textContent = totalIncome.toFixed(2);
                document.getElementById('total-expenses').textContent = totalExpenses.toFixed(2);
                document.getElementById('total-balance').textContent = totalBalance.toFixed(2);

                // Add event listeners to new buttons
                document.querySelectorAll('.edit-btn').forEach(btn => {
                    btn.addEventListener('click', this.handleEdit.bind(this));
                });
                document.querySelectorAll('.delete-btn').forEach(btn => {
                    btn.addEventListener('click', this.handleDelete.bind(this));
                });
            }

            handleEdit(e) {
                const id = e.target.dataset.id;
                const transaction = this.transactions.find(t => t.id === id);
                if (transaction) {
                    document.getElementById('edit-id').value = id;
                    document.getElementById('edit-amount').value = transaction.amount;
                    document.getElementById('edit-type').value = transaction.type;
                    document.getElementById('edit-date').value = transaction.date;
                    document.getElementById('edit-notes').value = transaction.notes;
                    editModal.show();
                }
            }

            handleDelete(e) {
                if (confirm('Are you sure you want to delete this transaction?')) {
                    const id = e.target.dataset.id;
                    this.deleteTransaction(id);
                }
            }

            applyFilters(filters) {
                this.currentFilters = filters;
                this.updateUI();
            }
        }

        // Initialize TransactionManager
        const manager = new TransactionManager();

        // Form submission handlers
        document.getElementById('transaction-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const transaction = {
                amount: parseFloat(document.getElementById('amount').value),
                type: document.getElementById('type').value,
                date: document.getElementById('date').value,
                notes: document.getElementById('notes').value
            };
            manager.addTransaction(transaction);
            e.target.reset();
        });

        document.getElementById('filter-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const filters = {
                minAmount: document.getElementById('min-amount').value ? parseFloat(document.getElementById('min-amount').value) : null,
                maxAmount: document.getElementById('max-amount').value ? parseFloat(document.getElementById('max-amount').value) : null,
                type: document.getElementById('filter-type').value,
                date: document.getElementById('filter-date').value,
                notes: document.getElementById('filter-notes').value
            };
            manager.applyFilters(filters);
        });

        document.getElementById('filter-form').addEventListener('reset', (e) => {
            setTimeout(() => {
                manager.applyFilters({});
            }, 0);
        });

        document.getElementById('save-edit').addEventListener('click', () => {
            const id = document.getElementById('edit-id').value;
            const updatedTransaction = {
                amount: parseFloat(document.getElementById('edit-amount').value),
                type: document.getElementById('edit-type').value,
                date: document.getElementById('edit-date').value,
                notes: document.getElementById('edit-notes').value
            };
            manager.editTransaction(id, updatedTransaction);
            editModal.hide();
        });

        // Initial UI update
        manager.updateUI();