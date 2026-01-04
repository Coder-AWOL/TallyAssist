// Support Page Functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeSupportPage();
});

function initializeSupportPage() {
    // Set up support action buttons
    setupSupportActions();
    
    // Set up help topic links
    setupHelpTopics();
}

function setupSupportActions() {
    // Knowledge Base button
    const knowledgeBaseBtn = document.querySelector('.support-card:nth-child(1) .support-action-btn');
    if (knowledgeBaseBtn) {
        knowledgeBaseBtn.addEventListener('click', function() {
            alert('Opening Knowledge Base...\n\nIn a real application, this would open the documentation portal.');
        });
    }
    
    // Live Chat button
    const liveChatBtn = document.querySelector('.support-card:nth-child(2) .support-action-btn');
    if (liveChatBtn) {
        liveChatBtn.addEventListener('click', function() {
            alert('Starting Live Chat...\n\nConnecting you with our support team.');
            
            // Simulate chat connection
            setTimeout(() => {
                const startChat = confirm('Support agent is available! Start chat session?');
                if (startChat) {
                    alert('Chat session started! Type your message below.');
                }
            }, 1500);
        });
    }
    
    // Phone Support button
    const phoneSupportBtn = document.querySelector('.support-card:nth-child(4) .support-action-btn');
    if (phoneSupportBtn) {
        phoneSupportBtn.addEventListener('click', function() {
            const phoneNumber = '+91-9876543210';
            const callNow = confirm(`Call our support team at ${phoneNumber}?`);
            
            if (callNow) {
                alert(`Dialing ${phoneNumber}...\n\nIn a real application, this would initiate a phone call.`);
            }
        });
    }
}

function setupHelpTopics() {
    // Set up help topic links
    document.querySelectorAll('.help-topic a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const topic = this.textContent;
            alert(`Opening help article: "${topic}"\n\nIn a real application, this would navigate to the specific help article.`);
        });
    });
}