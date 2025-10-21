// Enhanced Invoice Management System with Types
class InvoiceManager {
    constructor() {
        this.invoices = JSON.parse(localStorage.getItem('tallyassist_invoices')) || [];
        this.nextInvoiceId = this.invoices.length > 0 ? Math.max(...this.invoices.map(inv => parseInt(inv.id.split('-')[2]))) + 1 : 1;
        this.currentYear = new Date().getFullYear();
        this.listeners = [];
    }

    saveInvoices() {
        localStorage.setItem('tallyassist_invoices', JSON.stringify(this.invoices));
        this.notifyListeners();
    }

    // Add event listener for invoice updates
    addListener(callback) {
        this.listeners.push(callback);
    }

    // Remove event listener
    removeListener(callback) {
        this.listeners = this.listeners.filter(listener => listener !== callback);
    }

    // Notify all listeners about invoice changes
    notifyListeners() {
        this.listeners.forEach(callback => callback(this.invoices));
    }

    generateInvoiceId() {
        const id = `INV-${this.currentYear}-${this.nextInvoiceId.toString().padStart(4, '0')}`;
        this.nextInvoiceId++;
        return id;
    }

    createInvoice(invoiceData) {
        const invoice = {
            id: this.generateInvoiceId(),
            title: invoiceData.title,
            type: invoiceData.type, // 'income' or 'expense'
            clientName: invoiceData.clientName,
            clientEmail: invoiceData.clientEmail,
            clientPhone: invoiceData.clientPhone,
            clientAddress: invoiceData.clientAddress,
            invoiceDate: invoiceData.invoiceDate,
            dueDate: invoiceData.dueDate,
            items: invoiceData.items,
            subtotal: invoiceData.subtotal,
            taxRate: invoiceData.taxRate,
            taxAmount: invoiceData.taxAmount,
            total: invoiceData.total,
            notes: invoiceData.notes,
            status: invoiceData.status || 'pending',
            createdAt: new Date().toISOString(),
            paidDate: null
        };

        this.invoices.push(invoice);
        this.saveInvoices();
        this.updateInvoiceStats();
        return invoice;
    }

    // Search invoices by various fields
    searchInvoices(query) {
        if (!query) return this.invoices;
        
        const searchTerm = query.toLowerCase();
        return this.invoices.filter(invoice => 
            invoice.title.toLowerCase().includes(searchTerm) ||
            invoice.clientName.toLowerCase().includes(searchTerm) ||
            invoice.id.toLowerCase().includes(searchTerm) ||
            invoice.total.toString().includes(searchTerm) ||
            invoice.type.toLowerCase().includes(searchTerm)
        );
    }

    updateInvoiceStatus(invoiceId, status) {
        const invoice = this.invoices.find(inv => inv.id === invoiceId);
        if (invoice) {
            invoice.status = status;
            if (status === 'paid') {
                invoice.paidDate = new Date().toISOString();
            }
            this.saveInvoices();
            this.updateInvoiceStats();
        }
    }

    deleteInvoice(invoiceId) {
        this.invoices = this.invoices.filter(inv => inv.id !== invoiceId);
        this.saveInvoices();
        this.updateInvoiceStats();
    }

    getInvoices(filter = 'all', typeFilter = 'all') {
        let filteredInvoices = this.invoices;
        
        if (filter !== 'all') {
            filteredInvoices = filteredInvoices.filter(invoice => invoice.status === filter);
        }
        
        if (typeFilter !== 'all') {
            filteredInvoices = filteredInvoices.filter(invoice => invoice.type === typeFilter);
        }
        
        return filteredInvoices;
    }

    // Get dashboard statistics with types
    getDashboardStats() {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        
        const recentInvoices = this.invoices.filter(inv => 
            new Date(inv.createdAt) >= thirtyDaysAgo
        );

        // Calculate by type
        const incomeInvoices = recentInvoices.filter(inv => inv.type === 'income');
        const expenseInvoices = recentInvoices.filter(inv => inv.type === 'expense');

        const totalIncome = incomeInvoices
            .filter(inv => inv.status === 'paid')
            .reduce((sum, inv) => sum + inv.total, 0);

        const totalExpenses = expenseInvoices
            .filter(inv => inv.status === 'paid')
            .reduce((sum, inv) => sum + inv.total, 0);

        const netProfit = totalIncome - totalExpenses;

        const pendingInvoices = recentInvoices.filter(inv => 
            inv.status === 'pending' || inv.status === 'overdue'
        );

        const pendingAmount = pendingInvoices.reduce((sum, inv) => sum + inv.total, 0);

        return {
            totalIncome,
            totalExpenses,
            netProfit,
            pendingInvoices: pendingInvoices.length,
            pendingAmount,
            recentInvoicesCount: recentInvoices.length,
            incomeInvoices: incomeInvoices.length,
            expenseInvoices: expenseInvoices.length
        };
    }

    // Get financial data for charts
    getFinancialData(timePeriod = 30) {
        const now = new Date();
        const periodStart = new Date(now.getTime() - timePeriod * 24 * 60 * 60 * 1000);
        
        const periodInvoices = this.invoices.filter(inv => 
            new Date(inv.createdAt) >= periodStart
        );

        // Group by date for trend chart
        const dailyData = {};
        periodInvoices.forEach(invoice => {
            const date = new Date(invoice.createdAt).toLocaleDateString();
            if (!dailyData[date]) {
                dailyData[date] = { income: 0, expenses: 0 };
            }
            if (invoice.status === 'paid') {
                if (invoice.type === 'income') {
                    dailyData[date].income += invoice.total;
                } else if (invoice.type === 'expense') {
                    dailyData[date].expenses += invoice.total;
                }
            }
        });

        // Convert to arrays for charts
        const dates = Object.keys(dailyData).sort();
        const incomeData = dates.map(date => dailyData[date].income);
        const expenseData = dates.map(date => dailyData[date].expenses);

        return {
            labels: dates,
            income: incomeData,
            expenses: expenseData
        };
    }

    // Get data for expense categories pie chart
    getExpenseCategories() {
        const expenseInvoices = this.invoices.filter(inv => 
            inv.type === 'expense' && inv.status === 'paid'
        );
        
        // Group by invoice title (category) for demo
        const categories = {};
        expenseInvoices.forEach(invoice => {
            const category = invoice.title.split(' - ')[0] || invoice.title || 'Other';
            if (!categories[category]) {
                categories[category] = 0;
            }
            categories[category] += invoice.total;
        });

        return {
            labels: Object.keys(categories),
            data: Object.values(categories)
        };
    }

    updateInvoiceStats() {
        const pending = this.invoices.filter(inv => inv.status === 'pending').length;
        const paid = this.invoices.filter(inv => inv.status === 'paid').length;
        const overdue = this.invoices.filter(inv => inv.status === 'overdue').length;
        const total = this.invoices.length;

        // Update stats in UI if elements exist
        const pendingElement = document.getElementById('pendingCount');
        const paidElement = document.getElementById('paidCount');
        const overdueElement = document.getElementById('overdueCount');
        const totalElement = document.getElementById('totalCount');

        if (pendingElement) pendingElement.textContent = pending;
        if (paidElement) paidElement.textContent = paid;
        if (overdueElement) overdueElement.textContent = overdue;
        if (totalElement) totalElement.textContent = total;
    }

    renderInvoicesList(filter = 'all', typeFilter = 'all') {
        const container = document.getElementById('invoicesList');
        if (!container) return;

        const invoices = this.getInvoices(filter, typeFilter);
        
        if (invoices.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-file-invoice"></i>
                    <h3>No invoices found</h3>
                    <p>Create your first invoice to get started</p>
                    <button class="create-invoice-btn" id="emptyStateCreateBtn">
                        <i class="fas fa-plus"></i> Create Invoice
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = invoices.map(invoice => `
            <div class="invoice-item ${invoice.status}" data-invoice-id="${invoice.id}">
                <div class="invoice-checkbox">
                    <input type="checkbox" class="invoice-select">
                </div>
                <div class="invoice-details">
                    <div class="invoice-header">
                        <h4>${invoice.title}</h4>
                        <div class="invoice-meta">
                            <span class="invoice-id">${invoice.id}</span>
                            <span class="invoice-type ${invoice.type}">${invoice.type}</span>
                            <span class="invoice-status ${invoice.status}">${invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}</span>
                        </div>
                    </div>
                    <p class="invoice-client">${invoice.clientName}</p>
                    <p class="invoice-date">
                        ${invoice.status === 'paid' ? `Paid: ${new Date(invoice.paidDate).toLocaleDateString()}` : `Due: ${new Date(invoice.dueDate).toLocaleDateString()}`}
                    </p>
                </div>
                <div class="invoice-amount">
                    <p class="amount">₹${invoice.total.toLocaleString()}</p>
                    ${this.getStatusText(invoice)}
                </div>
                <div class="invoice-actions">
                    <button class="icon-btn view-btn" title="View Invoice" data-invoice-id="${invoice.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="icon-btn edit-btn" title="Edit Invoice" data-invoice-id="${invoice.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    ${invoice.status === 'pending' ? `
                        <button class="icon-btn send-btn" title="Send Reminder" data-invoice-id="${invoice.id}">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    ` : ''}
                    ${invoice.status === 'paid' ? `
                        <button class="icon-btn duplicate-btn" title="Duplicate Invoice" data-invoice-id="${invoice.id}">
                            <i class="fas fa-copy"></i>
                        </button>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    getStatusText(invoice) {
        const today = new Date();
        const dueDate = new Date(invoice.dueDate);
        
        if (invoice.status === 'overdue') {
            const daysOverdue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
            return `<p class="days-overdue">${daysOverdue} days overdue</p>`;
        } else if (invoice.status === 'pending') {
            const daysUntilDue = Math.floor((dueDate - today) / (1000 * 60 * 60 * 24));
            if (daysUntilDue < 0) {
                // Update status to overdue
                invoice.status = 'overdue';
                this.saveInvoices();
                const daysOverdue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
                return `<p class="days-overdue">${daysOverdue} days overdue</p>`;
            }
            return `<p class="due-in">Due in ${daysUntilDue} days</p>`;
        } else if (invoice.status === 'paid') {
            return `<p class="paid-date">Paid on time</p>`;
        }
        return '';
    }
}

// Initialize Invoice Manager
const invoiceManager = new InvoiceManager();

// Dashboard-specific functions
function updateDashboardData() {
    if (!document.getElementById('dashboardPage')) return;
    
    const stats = invoiceManager.getDashboardStats();
    const financialData = invoiceManager.getFinancialData(30);
    
    // Update summary cards
    document.getElementById('totalIncome').textContent = `₹${stats.totalIncome.toLocaleString()}`;
    document.getElementById('totalExpenses').textContent = `₹${stats.totalExpenses.toLocaleString()}`;
    document.getElementById('netProfit').textContent = `₹${stats.netProfit.toLocaleString()}`;
    document.getElementById('pendingInvoices').textContent = stats.pendingInvoices;
    
    // Update recent transactions
    updateRecentTransactions();
    
    // Update charts if they exist
    if (typeof window.updateDashboardCharts === 'function') {
        window.updateDashboardCharts(financialData);
    }
}

function updateRecentTransactions() {
    const container = document.querySelector('.transactions-list');
    if (!container) return;
    
    const recentInvoices = invoiceManager.getInvoices()
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 4);
    
    if (recentInvoices.length === 0) {
        container.innerHTML = `
            <div class="empty-transactions">
                <p>No recent transactions</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = recentInvoices.map(invoice => `
        <div class="transaction-item">
            <div class="transaction-info">
                <div class="transaction-icon ${invoice.type === 'income' ? 'income' : 'expense'}">
                    <i class="fas fa-${invoice.type === 'income' ? 'arrow-down' : 'arrow-up'}"></i>
                </div>
                <div class="transaction-details">
                    <h4>${invoice.title} - ${invoice.clientName}</h4>
                    <p>${new Date(invoice.createdAt).toLocaleDateString()} • ${invoice.type}</p>
                </div>
            </div>
            <div class="transaction-amount ${invoice.type === 'income' ? 'positive' : 'negative'}">
                ${invoice.type === 'income' ? '+' : '-'}₹${invoice.total.toLocaleString()}
            </div>
        </div>
    `).join('');
}

// Shared Invoice Form Functions
function initializeInvoiceForm(formId, itemsContainerId, addItemBtnId) {
    const form = document.getElementById(formId);
    const itemsContainer = document.getElementById(itemsContainerId);
    const addItemBtn = document.getElementById(addItemBtnId);

    if (addItemBtn) {
        addItemBtn.addEventListener('click', () => addInvoiceItem(itemsContainerId));
    }

    if (form) {
        form.addEventListener('submit', handleInvoiceSubmit);
    }

    // Initialize date fields
    setDefaultDates(formId);

    // Add event listeners to existing items
    initializeExistingItems(itemsContainerId);

    // Add tax rate change listener
    const taxRateInput = document.getElementById('taxRate') || document.getElementById('ntTaxRate');
    if (taxRateInput) {
        taxRateInput.addEventListener('input', calculateInvoiceTotal);
    }
}

function addInvoiceItem(containerId) {
    const container = document.getElementById(containerId);
    const itemId = Date.now();
    const itemRow = document.createElement('div');
    itemRow.className = 'item-row';
    itemRow.setAttribute('data-item-id', itemId);
    itemRow.innerHTML = `
        <input type="text" placeholder="Item description" class="item-description">
        <input type="number" placeholder="Qty" value="1" min="1" class="item-quantity">
        <input type="number" placeholder="Price" step="0.01" class="item-price">
        <span class="item-amount">₹0.00</span>
        <button type="button" class="remove-item"><i class="fas fa-trash"></i></button>
    `;

    container.insertBefore(itemRow, document.querySelector(`#${containerId} .add-item-btn`));

    // Add event listeners
    const inputs = itemRow.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', calculateInvoiceTotal);
    });

    itemRow.querySelector('.remove-item').addEventListener('click', function() {
        itemRow.remove();
        calculateInvoiceTotal();
    });

    // Trigger calculation for new item
    calculateInvoiceTotal();
}

function initializeExistingItems(containerId) {
    const container = document.getElementById(containerId);
    const existingItems = container.querySelectorAll('.item-row:not(.header)');
    
    existingItems.forEach(item => {
        const inputs = item.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('input', calculateInvoiceTotal);
        });

        item.querySelector('.remove-item').addEventListener('click', function() {
            item.remove();
            calculateInvoiceTotal();
        });
    });
}

function setDefaultDates(formPrefix = '') {
    const today = new Date().toISOString().split('T')[0];
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);
    const dueDateString = dueDate.toISOString().split('T')[0];

    const invoiceDateInput = document.getElementById(formPrefix ? `${formPrefix}InvoiceDate` : 'invoiceDate');
    const dueDateInput = document.getElementById(formPrefix ? `${formPrefix}DueDate` : 'dueDate');

    if (invoiceDateInput) invoiceDateInput.value = today;
    if (dueDateInput) dueDateInput.value = dueDateString;
}

function calculateInvoiceTotal() {
    let subtotal = 0;
    
    document.querySelectorAll('.item-row:not(.header)').forEach(row => {
        const qty = parseFloat(row.querySelector('.item-quantity').value) || 0;
        const price = parseFloat(row.querySelector('.item-price').value) || 0;
        const amount = qty * price;
        subtotal += amount;
        
        row.querySelector('.item-amount').textContent = `₹${amount.toFixed(2)}`;
    });

    const taxRate = parseFloat(document.getElementById('taxRate')?.value || document.getElementById('ntTaxRate')?.value || 18);
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;

    // Update summary
    const subtotalElement = document.getElementById('subtotalAmount') || document.getElementById('ntSubtotalAmount');
    const taxAmountElement = document.getElementById('taxAmount') || document.getElementById('ntTaxAmount');
    const totalElement = document.getElementById('totalAmount') || document.getElementById('ntTotalAmount');

    if (subtotalElement) subtotalElement.textContent = `₹${subtotal.toFixed(2)}`;
    if (taxAmountElement) taxAmountElement.textContent = `₹${taxAmount.toFixed(2)}`;
    if (totalElement) totalElement.textContent = `₹${total.toFixed(2)}`;
}

function handleInvoiceSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    
    // Collect items
    const items = [];
    document.querySelectorAll('.item-row:not(.header)').forEach(row => {
        const description = row.querySelector('.item-description').value;
        const quantity = parseFloat(row.querySelector('.item-quantity').value) || 0;
        const price = parseFloat(row.querySelector('.item-price').value) || 0;
        
        if (description && quantity > 0 && price > 0) {
            items.push({
                description,
                quantity,
                price,
                amount: quantity * price
            });
        }
    });

    if (items.length === 0) {
        alert('Please add at least one valid invoice item');
        return;
    }

    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const taxRate = parseFloat(document.getElementById('taxRate')?.value || document.getElementById('ntTaxRate')?.value || 18);
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;

    const invoiceData = {
        title: document.getElementById('invoiceTitle')?.value || document.getElementById('ntInvoiceTitle')?.value,
        type: document.getElementById('invoiceType')?.value || document.getElementById('ntInvoiceType')?.value,
        clientName: document.getElementById('clientName')?.value || document.getElementById('ntClientName')?.value,
        clientEmail: document.getElementById('clientEmail')?.value || document.getElementById('ntClientEmail')?.value,
        clientPhone: document.getElementById('clientPhone')?.value || document.getElementById('ntClientPhone')?.value,
        clientAddress: document.getElementById('clientAddress')?.value || document.getElementById('ntClientAddress')?.value,
        invoiceDate: document.getElementById('invoiceDate')?.value || document.getElementById('ntInvoiceDate')?.value,
        dueDate: document.getElementById('dueDate')?.value || document.getElementById('ntDueDate')?.value,
        items,
        subtotal,
        taxRate,
        taxAmount,
        total,
        notes: document.getElementById('notes')?.value || document.getElementById('ntNotes')?.value,
        status: 'pending'
    };

    const invoice = invoiceManager.createInvoice(invoiceData);
    
    alert(`Invoice ${invoice.id} created successfully!\nTitle: ${invoice.title}\nType: ${invoice.type}\nAmount: ₹${invoice.total}`);
    
    // Reset form
    form.reset();
    const itemsContainer = document.getElementById('invoiceItemsContainer') || document.getElementById('ntInvoiceItemsContainer');
    if (itemsContainer) {
        const itemsToRemove = itemsContainer.querySelectorAll('.item-row:not(.header)');
        itemsToRemove.forEach(item => item.remove());
        addInvoiceItem(itemsContainer.id); // Add one empty item
    }
    
    setDefaultDates();
    calculateInvoiceTotal();

    // Close modal if in invoices page
    const modal = document.getElementById('createInvoiceModal');
    if (modal) {
        modal.style.display = 'none';
    }

    // Redirect to invoices page if in new-transaction page
    if (window.location.pathname.includes('new-transaction.html')) {
        setTimeout(() => {
            window.location.href = 'invoices.html';
        }, 1500);
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Initialize invoice forms if they exist
    const invoiceForm = document.getElementById('invoiceForm');
    const newTransactionForm = document.getElementById('newTransactionInvoiceForm');
    
    if (invoiceForm) {
        initializeInvoiceForm('invoiceForm', 'invoiceItemsContainer', 'addItemBtn');
    }
    
    if (newTransactionForm) {
        initializeInvoiceForm('newTransactionInvoiceForm', 'ntInvoiceItemsContainer', 'ntAddItemBtn');
    }

    // Update invoice stats and render list
    invoiceManager.updateInvoiceStats();
    
    // Set up filter change listeners
    const statusFilter = document.getElementById('statusFilter');
    const typeFilter = document.getElementById('typeFilter');
    
    function updateInvoiceList() {
        const status = statusFilter ? statusFilter.value : 'all';
        const type = typeFilter ? typeFilter.value : 'all';
        invoiceManager.renderInvoicesList(status, type);
    }
    
    if (statusFilter) {
        statusFilter.addEventListener('change', updateInvoiceList);
    }
    
    if (typeFilter) {
        typeFilter.addEventListener('change', updateInvoiceList);
    }
    
    // Initial render
    updateInvoiceList();

    // Update dashboard data if on dashboard
    updateDashboardData();

    // Add listener for invoice updates
    invoiceManager.addListener(updateDashboardData);

    // Set up create invoice button
    const openCreateInvoiceBtn = document.getElementById('openCreateInvoice');
    if (openCreateInvoiceBtn) {
        openCreateInvoiceBtn.addEventListener('click', function() {
            openModal('createInvoiceModal');
        });
    }

    // Set up empty state create button
    document.addEventListener('click', function(e) {
        if (e.target.id === 'emptyStateCreateBtn') {
            openModal('createInvoiceModal');
        }
    });

    // Set up save draft buttons
    const saveDraftBtn = document.getElementById('saveDraftBtn');
    const ntSaveDraftBtn = document.getElementById('ntSaveDraftBtn');
    
    if (saveDraftBtn) {
        saveDraftBtn.addEventListener('click', function() {
            alert('Draft saved successfully!');
        });
    }
    
    if (ntSaveDraftBtn) {
        ntSaveDraftBtn.addEventListener('click', function() {
            alert('Draft saved successfully!');
        });
    }
});