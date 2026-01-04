// New Transaction Page Functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeTransactionTypeSelector();
});

function initializeTransactionTypeSelector() {
    const typeOptions = document.querySelectorAll('.type-option');
    const formSections = {
        invoice: document.getElementById('invoiceFormSection'),
        expense: document.getElementById('expenseFormSection'),
        income: document.getElementById('incomeFormSection')
    };

    typeOptions.forEach(option => {
        option.addEventListener('click', function() {
            const type = this.getAttribute('data-type');
            
            // Update active state
            typeOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            
            // Show/hide forms
            Object.values(formSections).forEach(section => {
                if (section) section.classList.add('hidden');
            });
            
            if (formSections[type]) {
                formSections[type].classList.remove('hidden');
            }
        });
    });
}