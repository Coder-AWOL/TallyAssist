// Add sample data if no invoices exist
function initializeSampleData() {
    const invoices = JSON.parse(localStorage.getItem('tallyassist_invoices')) || [];
    
    if (invoices.length === 0) {
        const sampleInvoices = [
            {
                id: 'INV-2024-0001',
                clientName: 'ABC Corporation',
                clientEmail: 'accounts@abccorp.com',
                clientPhone: '+91 9876543210',
                clientAddress: '123 Business Street, Mumbai',
                invoiceDate: '2024-03-01',
                dueDate: '2024-03-31',
                items: [
                    { description: 'Web Development Services', quantity: 1, price: 50000, amount: 50000 },
                    { description: 'UI/UX Design', quantity: 1, price: 25000, amount: 25000 }
                ],
                subtotal: 75000,
                taxRate: 18,
                taxAmount: 13500,
                total: 88500,
                notes: 'Thank you for your business!',
                status: 'paid',
                createdAt: '2024-03-01T10:00:00Z',
                paidDate: '2024-03-15T14:30:00Z'
            },
            {
                id: 'INV-2024-0002',
                clientName: 'XYZ Enterprises',
                clientEmail: 'billing@xyzenterprises.com',
                clientPhone: '+91 9876543211',
                clientAddress: '456 Corporate Avenue, Delhi',
                invoiceDate: '2024-03-10',
                dueDate: '2024-04-09',
                items: [
                    { description: 'Mobile App Development', quantity: 1, price: 75000, amount: 75000 },
                    { description: 'Backend API', quantity: 1, price: 35000, amount: 35000 }
                ],
                subtotal: 110000,
                taxRate: 18,
                taxAmount: 19800,
                total: 129800,
                notes: 'Please make payment within 30 days',
                status: 'pending',
                createdAt: '2024-03-10T09:15:00Z',
                paidDate: null
            },
            {
                id: 'INV-2024-0003',
                clientName: 'Tech Solutions Ltd',
                clientEmail: 'finance@techsolutions.com',
                clientPhone: '+91 9876543212',
                clientAddress: '789 Innovation Road, Bangalore',
                invoiceDate: '2024-02-15',
                dueDate: '2024-03-15',
                items: [
                    { description: 'Consulting Services', quantity: 10, price: 2000, amount: 20000 },
                    { description: 'Technical Support', quantity: 1, price: 15000, amount: 15000 }
                ],
                subtotal: 35000,
                taxRate: 18,
                taxAmount: 6300,
                total: 41300,
                notes: 'Overdue payment reminder',
                status: 'overdue',
                createdAt: '2024-02-15T11:30:00Z',
                paidDate: null
            }
        ];

        localStorage.setItem('tallyassist_invoices', JSON.stringify(sampleInvoices));
        
        // Refresh the invoice manager
        if (typeof invoiceManager !== 'undefined') {
            invoiceManager.invoices = sampleInvoices;
            invoiceManager.nextInvoiceId = 4;
            invoiceManager.updateInvoiceStats();
            updateDashboardData();
        }
    }
}

// Call this function when the app loads
document.addEventListener('DOMContentLoaded', function() {
    initializeSampleData();
});