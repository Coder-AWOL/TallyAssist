// Search Page Functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeSearchPage();
});

function initializeSearchPage() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const typeFilter = document.getElementById('searchTypeFilter');
    const statusFilter = document.getElementById('searchStatusFilter');
    const resultsContainer = document.getElementById('searchResults');
    const resultsCount = document.getElementById('resultsCount');
    const resultsStats = document.getElementById('resultsStats');
    
    function performSearch() {
        const query = searchInput.value.trim();
        const type = typeFilter.value;
        const status = statusFilter.value;
        
        // Get all invoices first
        let results = invoiceManager.getInvoices();
        
        // Apply search query
        if (query) {
            results = invoiceManager.searchInvoices(query);
        }
        
        // Apply type filter
        if (type !== 'all') {
            results = results.filter(invoice => invoice.type === type);
        }
        
        // Apply status filter
        if (status !== 'all') {
            results = results.filter(invoice => invoice.status === status);
        }
        
        updateResultsDisplay(results, query);
    }
    
    function updateResultsDisplay(results, query) {
        const totalAmount = results.reduce((sum, invoice) => sum + invoice.total, 0);
        const incomeCount = results.filter(inv => inv.type === 'income').length;
        const expenseCount = results.filter(inv => inv.type === 'expense').length;
        
        // Update results header
        if (query) {
            resultsCount.textContent = `Search Results for "${query}"`;
        } else {
            resultsCount.textContent = 'All Invoices';
        }
        
        resultsStats.textContent = `${results.length} invoices • ₹${totalAmount.toLocaleString()} • ${incomeCount} income • ${expenseCount} expense`;
        
        if (results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="no-results">
                    <div class="no-results-icon">
                        <i class="fas fa-search"></i>
                    </div>
                    <h3>No invoices found</h3>
                    <p>${query ? `No invoices match your search for "${query}"` : 'No invoices available. Create your first invoice to get started.'}</p>
                    ${!query ? `
                        <button class="create-invoice-btn" onclick="openPage('invoices.html')">
                            <i class="fas fa-plus"></i> Create Invoice
                        </button>
                    ` : ''}
                </div>
            `;
            return;
        }
        
        resultsContainer.innerHTML = results.map(invoice => `
            <div class="invoice-search-result ${invoice.type} ${invoice.status}">
                <div class="result-main">
                    <div class="result-header">
                        <h4 class="result-title">${invoice.title}</h4>
                        <div class="result-badges">
                            <span class="badge type-badge ${invoice.type}">
                                <i class="fas fa-${invoice.type === 'income' ? 'arrow-down' : 'arrow-up'}"></i>
                                ${invoice.type}
                            </span>
                            <span class="badge status-badge ${invoice.status}">
                                ${invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                            </span>
                        </div>
                    </div>
                    
                    <div class="result-details">
                        <div class="detail-group">
                            <span class="detail-label">
                                <i class="fas fa-user"></i>
                                Client
                            </span>
                            <span class="detail-value">${invoice.clientName}</span>
                        </div>
                        <div class="detail-group">
                            <span class="detail-label">
                                <i class="fas fa-calendar"></i>
                                Date
                            </span>
                            <span class="detail-value">${new Date(invoice.invoiceDate).toLocaleDateString()}</span>
                        </div>
                        <div class="detail-group">
                            <span class="detail-label">
                                <i class="fas fa-hashtag"></i>
                                ID
                            </span>
                            <span class="detail-value">${invoice.id}</span>
                        </div>
                    </div>
                </div>
                
                <div class="result-side">
                    <div class="result-amount ${invoice.type}">
                        <span class="amount-sign">${invoice.type === 'income' ? '+' : '-'}</span>
                        ₹${invoice.total.toLocaleString()}
                    </div>
                    <div class="result-actions">
                        <button class="action-btn view-btn" onclick="viewInvoiceDetails('${invoice.id}')">
                            <i class="fas fa-eye"></i>
                            View
                        </button>
                        <button class="action-btn edit-btn" onclick="openPage('invoices.html')">
                            <i class="fas fa-edit"></i>
                            Edit
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    // Event listeners
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });
    
    typeFilter.addEventListener('change', performSearch);
    statusFilter.addEventListener('change', performSearch);
    
    // Initial search with empty query shows all
    performSearch();
    
    // Focus search input on page load
    searchInput.focus();
}

// View Invoice Details Function
function viewInvoiceDetails(invoiceId) {
    const invoice = invoiceManager.invoices.find(inv => inv.id === invoiceId);
    if (!invoice) {
        alert('Invoice not found!');
        return;
    }
    
    // Create and show invoice details modal
    showInvoiceDetailsModal(invoice);
}

function showInvoiceDetailsModal(invoice) {
    // Create modal HTML
    const modalHTML = `
        <div id="invoiceDetailsModal" class="modal">
            <div class="modal-content large-modal" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h2>Invoice Details</h2>
                    <button class="close-modal" onclick="closeModal('invoiceDetailsModal')">&times;</button>
                </div>
                
                <div class="invoice-details-content">
                    <!-- Invoice Header -->
                    <div class="details-header">
                        <div class="invoice-title-section">
                            <h3>${invoice.title}</h3>
                            <div class="invoice-meta-badges">
                                <span class="badge type-badge ${invoice.type}">
                                    <i class="fas fa-${invoice.type === 'income' ? 'arrow-down' : 'arrow-up'}"></i>
                                    ${invoice.type.toUpperCase()}
                                </span>
                                <span class="badge status-badge ${invoice.status}">
                                    ${invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                                </span>
                            </div>
                        </div>
                        <div class="invoice-id">
                            <strong>Invoice ID:</strong> ${invoice.id}
                        </div>
                    </div>
                    
                    <!-- Client Information -->
                    <div class="details-section">
                        <h4><i class="fas fa-user-tie"></i> Client Information</h4>
                        <div class="client-details">
                            <div class="client-info">
                                <p><strong>Name:</strong> ${invoice.clientName}</p>
                                ${invoice.clientEmail ? `<p><strong>Email:</strong> ${invoice.clientEmail}</p>` : ''}
                                ${invoice.clientPhone ? `<p><strong>Phone:</strong> ${invoice.clientPhone}</p>` : ''}
                                ${invoice.clientAddress ? `<p><strong>Address:</strong> ${invoice.clientAddress}</p>` : ''}
                            </div>
                        </div>
                    </div>
                    
                    <!-- Invoice Dates -->
                    <div class="details-section">
                        <h4><i class="fas fa-calendar-alt"></i> Dates</h4>
                        <div class="dates-grid">
                            <div class="date-item">
                                <strong>Invoice Date:</strong>
                                <span>${new Date(invoice.invoiceDate).toLocaleDateString()}</span>
                            </div>
                            <div class="date-item">
                                <strong>Due Date:</strong>
                                <span>${new Date(invoice.dueDate).toLocaleDateString()}</span>
                            </div>
                            <div class="date-item">
                                <strong>Created On:</strong>
                                <span>${new Date(invoice.createdAt).toLocaleDateString()}</span>
                            </div>
                            ${invoice.paidDate ? `
                                <div class="date-item">
                                    <strong>Paid On:</strong>
                                    <span>${new Date(invoice.paidDate).toLocaleDateString()}</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    
                    <!-- Invoice Items -->
                    <div class="details-section">
                        <h4><i class="fas fa-list"></i> Items</h4>
                        <div class="items-table">
                            <div class="items-header">
                                <span>Description</span>
                                <span>Quantity</span>
                                <span>Price</span>
                                <span>Amount</span>
                            </div>
                            ${invoice.items.map(item => `
                                <div class="item-row">
                                    <span class="item-description">${item.description}</span>
                                    <span class="item-quantity">${item.quantity}</span>
                                    <span class="item-price">₹${item.price.toLocaleString()}</span>
                                    <span class="item-amount">₹${item.amount.toLocaleString()}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <!-- Invoice Summary -->
                    <div class="details-section">
                        <h4><i class="fas fa-calculator"></i> Summary</h4>
                        <div class="summary-grid">
                            <div class="summary-item">
                                <strong>Subtotal:</strong>
                                <span>₹${invoice.subtotal.toLocaleString()}</span>
                            </div>
                            <div class="summary-item">
                                <strong>Tax Rate:</strong>
                                <span>${invoice.taxRate}%</span>
                            </div>
                            <div class="summary-item">
                                <strong>Tax Amount:</strong>
                                <span>₹${invoice.taxAmount.toLocaleString()}</span>
                            </div>
                            <div class="summary-item total">
                                <strong>Total Amount:</strong>
                                <span>₹${invoice.total.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Notes -->
                    ${invoice.notes ? `
                        <div class="details-section">
                            <h4><i class="fas fa-sticky-note"></i> Notes</h4>
                            <div class="notes-content">
                                <p>${invoice.notes}</p>
                            </div>
                        </div>
                    ` : ''}
                    
                    <!-- Actions -->
                    <div class="details-actions">
                        <button class="action-btn secondary" onclick="closeModal('invoiceDetailsModal')">
                            <i class="fas fa-times"></i>
                            Close
                        </button>
                        <button class="action-btn primary" onclick="printInvoice('${invoice.id}')">
                            <i class="fas fa-print"></i>
                            Print
                        </button>
                        ${invoice.status === 'pending' ? `
                            <button class="action-btn success" onclick="markAsPaid('${invoice.id}')">
                                <i class="fas fa-check"></i>
                                Mark as Paid
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Show modal
    openModal('invoiceDetailsModal');
}

// Additional functions for invoice actions
function printInvoice(invoiceId) {
    alert(`Printing invoice ${invoiceId}...\n\nIn a real application, this would generate a printable PDF.`);
}

function markAsPaid(invoiceId) {
    if (confirm('Mark this invoice as paid?')) {
        invoiceManager.updateInvoiceStatus(invoiceId, 'paid');
        closeModal('invoiceDetailsModal');
        alert('Invoice marked as paid!');
        
        // Refresh search results if on search page
        if (typeof initializeSearchPage === 'function') {
            setTimeout(initializeSearchPage, 500);
        }
    }
}