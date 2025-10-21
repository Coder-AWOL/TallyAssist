// Invoices Page Functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeInvoicesPage();
});

function initializeInvoicesPage() {
    setupInvoiceViewButtons();
    setupInvoiceFilters();
    setupInvoiceActions();
    
    // Initial render
    invoiceManager.renderInvoicesList();
    invoiceManager.updateInvoiceStats();
}

function setupInvoiceViewButtons() {
    document.addEventListener('click', function(e) {
        // Handle view buttons in invoice list
        if (e.target.closest('.view-btn')) {
            const viewBtn = e.target.closest('.view-btn');
            const invoiceId = viewBtn.getAttribute('data-invoice-id');
            if (invoiceId) {
                viewInvoiceDetails(invoiceId);
            }
        }
        
        // Handle view buttons in search results (if on invoices page)
        if (e.target.closest('.action-btn.view-btn') && !e.target.closest('.search-results')) {
            const invoiceItem = e.target.closest('.invoice-item');
            if (invoiceItem) {
                const invoiceId = invoiceItem.getAttribute('data-invoice-id');
                if (invoiceId) {
                    viewInvoiceDetails(invoiceId);
                }
            }
        }
    });
}

function setupInvoiceFilters() {
    const statusFilter = document.getElementById('statusFilter');
    const typeFilter = document.getElementById('typeFilter');
    const dateFilter = document.getElementById('dateFilter');
    
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
    
    if (dateFilter) {
        dateFilter.addEventListener('change', function() {
            // In a real app, this would filter by date range
            console.log('Date filter changed to:', this.value);
            updateInvoiceList();
        });
    }
}

function setupInvoiceActions() {
    // Export button
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            const selectedInvoices = document.querySelectorAll('.invoice-checkbox input:checked');
            if (selectedInvoices.length === 0) {
                alert('Please select at least one invoice to export');
                return;
            }
            alert(`Exporting ${selectedInvoices.length} invoices...\n\nIn a real application, this would generate a CSV/PDF file.`);
        });
    }
    
    // Send reminders button
    const sendRemindersBtn = document.getElementById('sendRemindersBtn');
    if (sendRemindersBtn) {
        sendRemindersBtn.addEventListener('click', function() {
            const selectedInvoices = document.querySelectorAll('.invoice-checkbox input:checked');
            if (selectedInvoices.length === 0) {
                alert('Please select at least one invoice to send reminders');
                return;
            }
            
            const pendingInvoices = Array.from(selectedInvoices).filter(checkbox => {
                const invoiceItem = checkbox.closest('.invoice-item');
                return invoiceItem.classList.contains('pending') || invoiceItem.classList.contains('overdue');
            });
            
            if (pendingInvoices.length === 0) {
                alert('Only pending or overdue invoices can receive reminders');
                return;
            }
            
            alert(`Sending reminders for ${pendingInvoices.length} selected invoices...\n\nIn a real application, this would send email/SMS reminders.`);
        });
    }
    
    // Setup individual invoice action buttons
    document.addEventListener('click', function(e) {
        // Edit button
        if (e.target.closest('.edit-btn')) {
            const editBtn = e.target.closest('.edit-btn');
            const invoiceId = editBtn.getAttribute('data-invoice-id');
            if (invoiceId) {
                alert(`Editing invoice: ${invoiceId}\n\nIn a real application, this would open the invoice in edit mode.`);
            }
        }
        
        // Send reminder button
        if (e.target.closest('.send-btn')) {
            const sendBtn = e.target.closest('.send-btn');
            const invoiceId = sendBtn.getAttribute('data-invoice-id');
            if (invoiceId) {
                alert(`Sending reminder for: ${invoiceId}\n\nIn a real application, this would send a payment reminder to the client.`);
            }
        }
        
        // Duplicate button
        if (e.target.closest('.duplicate-btn')) {
            const duplicateBtn = e.target.closest('.duplicate-btn');
            const invoiceId = duplicateBtn.getAttribute('data-invoice-id');
            if (invoiceId) {
                const invoice = invoiceManager.invoices.find(inv => inv.id === invoiceId);
                if (invoice) {
                    // Create a duplicate invoice
                    const duplicateData = {
                        title: `${invoice.title} (Copy)`,
                        type: invoice.type,
                        clientName: invoice.clientName,
                        clientEmail: invoice.clientEmail,
                        clientPhone: invoice.clientPhone,
                        clientAddress: invoice.clientAddress,
                        invoiceDate: new Date().toISOString().split('T')[0],
                        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        items: invoice.items.map(item => ({...item})),
                        subtotal: invoice.subtotal,
                        taxRate: invoice.taxRate,
                        taxAmount: invoice.taxAmount,
                        total: invoice.total,
                        notes: invoice.notes,
                        status: 'pending'
                    };
                    
                    const newInvoice = invoiceManager.createInvoice(duplicateData);
                    alert(`Invoice duplicated successfully!\nNew Invoice ID: ${newInvoice.id}`);
                }
            }
        }
        
        // Empty state create button
        if (e.target.id === 'emptyStateCreateBtn') {
            openModal('createInvoiceModal');
        }
    });
    
    // Select all checkbox functionality
    document.addEventListener('change', function(e) {
        if (e.target.id === 'selectAllInvoices') {
            const checkboxes = document.querySelectorAll('.invoice-checkbox input');
            checkboxes.forEach(checkbox => {
                checkbox.checked = e.target.checked;
            });
        }
    });
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
                        ${invoice.status === 'pending' || invoice.status === 'overdue' ? `
                            <button class="action-btn success" onclick="markInvoiceAsPaid('${invoice.id}')">
                                <i class="fas fa-check"></i>
                                Mark as Paid
                            </button>
                        ` : ''}
                        <button class="action-btn warning" onclick="deleteInvoice('${invoice.id}')">
                            <i class="fas fa-trash"></i>
                            Delete
                        </button>
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
    const invoice = invoiceManager.invoices.find(inv => inv.id === invoiceId);
    if (invoice) {
        alert(`Printing invoice: ${invoice.id}\n\nTitle: ${invoice.title}\nClient: ${invoice.clientName}\nAmount: ₹${invoice.total}\n\nIn a real application, this would generate a printable PDF.`);
    }
}

function markInvoiceAsPaid(invoiceId) {
    if (confirm('Mark this invoice as paid? This action cannot be undone.')) {
        invoiceManager.updateInvoiceStatus(invoiceId, 'paid');
        closeModal('invoiceDetailsModal');
        alert('Invoice marked as paid successfully!');
        
        // Refresh the invoices list
        setTimeout(() => {
            invoiceManager.renderInvoicesList();
            invoiceManager.updateInvoiceStats();
        }, 500);
    }
}

function deleteInvoice(invoiceId) {
    if (confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) {
        invoiceManager.deleteInvoice(invoiceId);
        closeModal('invoiceDetailsModal');
        alert('Invoice deleted successfully!');
        
        // Refresh the invoices list
        setTimeout(() => {
            invoiceManager.renderInvoicesList();
            invoiceManager.updateInvoiceStats();
        }, 500);
    }
}

// Update the invoice list rendering to include data attributes for view buttons
// This function overrides the default renderInvoicesList to add proper data attributes
const originalRenderInvoicesList = invoiceManager.renderInvoicesList;
invoiceManager.renderInvoicesList = function(filter = 'all', typeFilter = 'all') {
    originalRenderInvoicesList.call(this, filter, typeFilter);
    
    // Add data attributes to view buttons
    setTimeout(() => {
        document.querySelectorAll('.view-btn').forEach(btn => {
            const invoiceItem = btn.closest('.invoice-item');
            if (invoiceItem) {
                const invoiceId = invoiceItem.getAttribute('data-invoice-id');
                if (invoiceId) {
                    btn.setAttribute('data-invoice-id', invoiceId);
                }
            }
        });
    }, 100);
};