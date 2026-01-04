// Dashboard specific functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeCharts();
    setupDashboardFilters();
});

// Make this function available globally for theme updates and data updates
window.updateDashboardCharts = function(financialData) {
    updateChartsWithData(financialData);
};

function initializeCharts() {
    // Get real data from invoice manager
    const financialData = invoiceManager.getFinancialData(30);
    updateChartsWithData(financialData);
}

function updateChartsWithData(financialData) {
    const isDarkTheme = localStorage.getItem('darkTheme') === 'true';
    const textColor = isDarkTheme ? '#e0e0e0' : '#666';
    const gridColor = isDarkTheme ? '#404040' : '#e0e0e0';
    
    // Income vs Expenses Chart
    const incomeExpenseCtx = document.getElementById('incomeExpenseChart');
    if (incomeExpenseCtx) {
        // Destroy existing chart if it exists
        if (incomeExpenseCtx.chart) {
            incomeExpenseCtx.chart.destroy();
        }
        
        incomeExpenseCtx.chart = new Chart(incomeExpenseCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: financialData.labels,
                datasets: [
                    {
                        label: 'Income',
                        data: financialData.income,
                        backgroundColor: '#28a745',
                        borderColor: '#28a745',
                        borderWidth: 1
                    },
                    {
                        label: 'Expenses',
                        data: financialData.expenses,
                        backgroundColor: '#dc3545',
                        borderColor: '#dc3545',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: textColor
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: textColor,
                            callback: function(value) {
                                return '₹' + value.toLocaleString();
                            }
                        },
                        grid: {
                            color: gridColor
                        }
                    },
                    x: {
                        ticks: {
                            color: textColor
                        },
                        grid: {
                            color: gridColor
                        }
                    }
                }
            }
        });
    }

    // Expense Categories Pie Chart with real data
    const expenseCategoryCtx = document.getElementById('expenseCategoryChart');
    if (expenseCategoryCtx) {
        if (expenseCategoryCtx.chart) {
            expenseCategoryCtx.chart.destroy();
        }
        
        const expenseData = invoiceManager.getExpenseCategories();
        
        expenseCategoryCtx.chart = new Chart(expenseCategoryCtx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: expenseData.labels,
                datasets: [{
                    data: expenseData.data,
                    backgroundColor: [
                        '#0b3d91', '#28a745', '#ffc107', '#dc3545', '#6f42c1',
                        '#e83e8c', '#fd7e14', '#20c997', '#6610f2', '#6f42c1'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: textColor
                        }
                    }
                }
            }
        });
    }

    // Monthly Trend Chart
    const monthlyTrendCtx = document.getElementById('monthlyTrendChart');
    if (monthlyTrendCtx) {
        if (monthlyTrendCtx.chart) {
            monthlyTrendCtx.chart.destroy();
        }
        
        monthlyTrendCtx.chart = new Chart(monthlyTrendCtx.getContext('2d'), {
            type: 'line',
            data: {
                labels: financialData.labels,
                datasets: [
                    {
                        label: 'Income Trend',
                        data: financialData.income,
                        borderColor: '#28a745',
                        backgroundColor: isDarkTheme ? 'rgba(40, 167, 69, 0.2)' : 'rgba(40, 167, 69, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Expense Trend',
                        data: financialData.expenses,
                        borderColor: '#dc3545',
                        backgroundColor: isDarkTheme ? 'rgba(220, 53, 69, 0.2)' : 'rgba(220, 53, 69, 0.1)',
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: textColor
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: textColor,
                            callback: function(value) {
                                return '₹' + value.toLocaleString();
                            }
                        },
                        grid: {
                            color: gridColor
                        }
                    },
                    x: {
                        ticks: {
                            color: textColor
                        },
                        grid: {
                            color: gridColor
                        }
                    }
                }
            }
        });
    }
}

function setupDashboardFilters() {
    const timePeriodSelect = document.getElementById('timePeriod');
    if (timePeriodSelect) {
        timePeriodSelect.addEventListener('change', function() {
            const financialData = invoiceManager.getFinancialData(parseInt(this.value));
            updateChartsWithData(financialData);
        });
    }
}

// Update charts when theme changes
window.updateChartThemes = function(isDark) {
    const financialData = invoiceManager.getFinancialData(30);
    updateChartsWithData(financialData);
};