// Calculator functionality
class Calculator {
  constructor(previousOperandElement, currentOperandElement) {
    this.previousOperandElement = previousOperandElement;
    this.currentOperandElement = currentOperandElement;
    this.clear();
  }

  clear() {
    this.currentOperand = '0';
    this.previousOperand = '';
    this.operation = undefined;
  }

  delete() {
    if (this.currentOperand === '0' || this.currentOperand.length === 1) {
      this.currentOperand = '0';
    } else {
      this.currentOperand = this.currentOperand.toString().slice(0, -1);
    }
  }

  appendNumber(number) {
    if (number === '.' && this.currentOperand.includes('.')) return;
    
    if (this.currentOperand === '0' && number !== '.') {
      this.currentOperand = number.toString();
    } else {
      this.currentOperand = this.currentOperand.toString() + number.toString();
    }
  }

  chooseOperation(operation) {
    if (this.currentOperand === '') return;
    if (this.previousOperand !== '') {
      this.compute();
    }
    this.operation = operation;
    this.previousOperand = this.currentOperand;
    this.currentOperand = '';
  }

  compute() {
    let computation;
    const prev = parseFloat(this.previousOperand);
    const current = parseFloat(this.currentOperand);
    if (isNaN(prev) || isNaN(current)) return;

    switch (this.operation) {
      case '+':
        computation = prev + current;
        break;
      case '−':
        computation = prev - current;
        break;
      case '×':
        computation = prev * current;
        break;
      case '÷':
        computation = prev / current;
        break;
      default:
        return;
    }

    this.currentOperand = computation.toString();
    this.operation = undefined;
    this.previousOperand = '';
  }

  calculatePercentage() {
    if (this.currentOperand === '') return;
    const current = parseFloat(this.currentOperand);
    this.currentOperand = (current / 100).toString();
  }

  getDisplayNumber(number) {
    const stringNumber = number.toString();
    const integerDigits = parseFloat(stringNumber.split('.')[0]);
    const decimalDigits = stringNumber.split('.')[1];
    let integerDisplay;
    
    if (isNaN(integerDigits)) {
      integerDisplay = '';
    } else {
      integerDisplay = integerDigits.toLocaleString('en', {
        maximumFractionDigits: 0
      });
    }
    
    if (decimalDigits != null) {
      return `${integerDisplay}.${decimalDigits}`;
    } else {
      return integerDisplay;
    }
  }

  updateDisplay() {
    this.currentOperandElement.innerText = this.getDisplayNumber(this.currentOperand);
    
    if (this.operation != null) {
      this.previousOperandElement.innerText = 
        `${this.getDisplayNumber(this.previousOperand)} ${this.operation}`;
    } else {
      this.previousOperandElement.innerText = '';
    }
  }
}

// Initialize calculator
const previousOperandElement = document.getElementById('previousOperand');
const currentOperandElement = document.getElementById('currentOperand');
const calculator = new Calculator(previousOperandElement, currentOperandElement);

// Add event listeners to calculator buttons
document.querySelectorAll('.calc-btn').forEach(button => {
  button.addEventListener('click', () => {
    if (button.hasAttribute('data-number')) {
      calculator.appendNumber(button.getAttribute('data-number'));
      calculator.updateDisplay();
    } else if (button.hasAttribute('data-action')) {
      const action = button.getAttribute('data-action');
      
      switch (action) {
        case 'clear':
          calculator.clear();
          calculator.updateDisplay();
          break;
        case 'delete':
          calculator.delete();
          calculator.updateDisplay();
          break;
        case 'percentage':
          calculator.calculatePercentage();
          calculator.updateDisplay();
          break;
        case 'decimal':
          calculator.appendNumber('.');
          calculator.updateDisplay();
          break;
        case 'calculate':
          calculator.compute();
          calculator.updateDisplay();
          break;
        default:
          // For operators
          calculator.chooseOperation(button.innerText);
          calculator.updateDisplay();
          break;
      }
    }
  });
});

// Financial Tools Functions
function openTaxCalculator() {
  openModal('taxCalculator');
}

function openCurrencyConverter() {
  alert('Currency Converter feature will be implemented soon!');
}

function openLoanCalculator() {
  alert('Loan Calculator feature will be implemented soon!');
}

function openInvestmentCalculator() {
  alert('Investment Calculator feature will be implemented soon!');
}

// Tax Calculator Function
function calculateTax() {
  const amount = parseFloat(document.getElementById('amount').value);
  const taxRate = parseFloat(document.getElementById('taxRate').value);
  const taxType = document.getElementById('taxType').value;
  
  if (isNaN(amount) || isNaN(taxRate)) {
    document.getElementById('taxResult').innerHTML = 
      '<p style="color: red;">Please enter valid numbers for amount and tax rate.</p>';
    return;
  }
  
  const taxAmount = (amount * taxRate) / 100;
  const totalAmount = amount + taxAmount;
  
  document.getElementById('taxResult').innerHTML = `
    <h3>Tax Calculation Result</h3>
    <p><strong>Tax Type:</strong> ${taxType.toUpperCase()}</p>
    <p><strong>Original Amount:</strong> ₹${amount.toFixed(2)}</p>
    <p><strong>Tax Rate:</strong> ${taxRate}%</p>
    <p><strong>Tax Amount:</strong> ₹${taxAmount.toFixed(2)}</p>
    <p><strong>Total Amount (including tax):</strong> ₹${totalAmount.toFixed(2)}</p>
  `;
}
