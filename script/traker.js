  // Initialize Modal
  const editModal = new bootstrap.Modal(document.getElementById('editModal'));
        
  class TransactionManager {
      constructor() {
          this.transactions = JSON.parse(localStorage.getItem('transactions')) || [];
          this.currentFilters = {};
          console.log('Initial transactions:', this.transactions); // Debug log
      }

      addTransaction(transaction) {
          transaction.id = Date.now().toString();
          this.transactions.push(transaction);
          console.log('Added transaction:', transaction); // Debug log
          this.saveToLocalStorage();
          this.updateUI();
      }

      // Previous methods remain the same

      updateUI() {
          const filteredTransactions = this.getFilteredTransactions();
          console.log('Filtered transactions:', filteredTransactions); // Debug log
          
          const tableBody = document.getElementById('transactions-table');
          const noTransactionsDiv = document.getElementById('no-transactions');

          if (filteredTransactions.length === 0) {
              tableBody.innerHTML = '';
              noTransactionsDiv.classList.remove('d-none');
          } else {
              noTransactionsDiv.classList.add('d-none');
              tableBody.innerHTML = filteredTransactions.map(t => `
                  <tr>
                      <td>${new Date(t.date).toLocaleDateString()}</td>
                      <td>
                          <span class="badge bg-${t.type === 'income' ? 'success' : 'danger'} text-white">
                              ${t.type.charAt(0).toUpperCase() + t.type.slice(1)}
                          </span>
                      </td>
                      <td class="text-${t.type === 'income' ? 'success' : 'danger'}">
                          $${parseFloat(t.amount).toFixed(2)}
                      </td>
                      <td>${t.notes || '-'}</td>
                      <td>
                          <div class="btn-group btn-group-sm">
                              <button class="btn btn-outline-primary edit-btn" data-id="${t.id}">
                                  Edit
                              </button>
                              <button class="btn btn-outline-danger delete-btn" data-id="${t.id}">
                                  Delete
                              </button>
                          </div>
                      </td>
                  </tr>
              `).join('');
          }

          // Update totals
          const totalIncome = this.transactions
              .filter(t => t.type === 'income')
              .reduce((sum, t) => sum + parseFloat(t.amount), 0);
          
          const totalExpenses = this.transactions
              .filter(t => t.type === 'expense')
              .reduce((sum, t) => sum + parseFloat(t.amount), 0);
          
          const totalBalance = totalIncome - totalExpenses;

          document.getElementById('total-income').textContent = totalIncome.toFixed(2);
          document.getElementById('total-expenses').textContent = totalExpenses.toFixed(2);
          document.getElementById('total-balance').textContent = totalBalance.toFixed(2);

          