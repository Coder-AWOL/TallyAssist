// AI Insights Page Functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeAIInsights();
});

function initializeAIInsights() {
    // Set up refresh button
    const refreshBtn = document.querySelector('.refresh-insights-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshInsights);
    }
    
    // Set up time filter
    const timeFilter = document.getElementById('insightTimeFilter');
    if (timeFilter) {
        timeFilter.addEventListener('change', filterHistoricalInsights);
    }
    
    // Set up insight action buttons
    setupInsightActions();
}

function refreshInsights() {
    const refreshBtn = document.querySelector('.refresh-insights-btn');
    const originalText = refreshBtn.innerHTML;
    
    // Show loading state
    refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
    refreshBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        // Show success message
        alert('New insights generated successfully!');
        
        // Restore button
        refreshBtn.innerHTML = originalText;
        refreshBtn.disabled = false;
    }, 2000);
}

function filterHistoricalInsights() {
    const timeFilter = document.getElementById('insightTimeFilter');
    const selectedValue = timeFilter.value;
    
    // In a real application, this would filter the data from an API
    console.log('Filtering insights for:', selectedValue, 'days');
    
    // Show loading state
    const historyItems = document.querySelectorAll('.history-item');
    historyItems.forEach(item => {
        item.style.opacity = '0.5';
    });
    
    setTimeout(() => {
        historyItems.forEach(item => {
            item.style.opacity = '1';
        });
    }, 500);
}

function setupInsightActions() {
    // Set up primary action buttons
    document.querySelectorAll('.insight-action-btn.primary').forEach(btn => {
        btn.addEventListener('click', function() {
            const insightCard = this.closest('.insight-card');
            const insightTitle = insightCard.querySelector('.insight-title h4').textContent;
            
            // Handle different insight types
            if (insightTitle.includes('Expense Optimization')) {
                alert('Opening supplier recommendations...');
            } else if (insightTitle.includes('Revenue Concentration')) {
                alert('Showing marketing tips and client acquisition strategies...');
            } else if (insightTitle.includes('Cash Flow Alert')) {
                alert('Sending payment reminders to clients...');
            } else if (insightTitle.includes('Tax Savings')) {
                alert('Opening tax deduction guide...');
            }
        });
    });
    
    // Set up secondary action buttons
    document.querySelectorAll('.insight-action-btn.secondary').forEach(btn => {
        btn.addEventListener('click', function() {
            const insightCard = this.closest('.insight-card');
            const insightTitle = insightCard.querySelector('.insight-title h4').textContent;
            
            if (this.textContent.includes('Dismiss') || this.textContent.includes('Ignore')) {
                if (confirm(`Are you sure you want to dismiss "${insightTitle}"?`)) {
                    insightCard.style.opacity = '0.5';
                    setTimeout(() => {
                        insightCard.remove();
                        updateInsightStats();
                    }, 300);
                }
            } else if (this.textContent.includes('Later')) {
                alert('Insight will be shown again in 7 days.');
            }
        });
    });
}

function updateInsightStats() {
    // Update the insight count in the stats
    const remainingInsights = document.querySelectorAll('.insight-card').length;
    const insightCountElement = document.querySelector('.ai-stat-number');
    
    if (insightCountElement) {
        insightCountElement.textContent = remainingInsights;
    }
}