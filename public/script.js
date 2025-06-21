
class Dashboard {
    constructor() {
        this.initializeWebhookUrl();
        this.updateStats();
        this.startAutoRefresh();
        this.updateStartTime();
    }

    initializeWebhookUrl() {
        const webhookUrlElement = document.getElementById('webhook-url');
        if (webhookUrlElement) {
            webhookUrlElement.textContent = `${window.location.origin}/webhook`;
        }
    }

    async updateStats() {
        try {
            const response = await fetch('/api/stats');
            const stats = await response.json();

            // Update stat cards
            document.getElementById('total-messages').textContent = stats.totalMessages.toLocaleString();
            document.getElementById('total-users').textContent = stats.totalUsers.toLocaleString();
            document.getElementById('uptime').textContent = this.formatUptime(stats.uptime);

            // Update last activity
            const lastActivityElement = document.getElementById('last-activity');
            if (stats.lastMessage) {
                lastActivityElement.textContent = this.formatTimeAgo(new Date(stats.lastMessage.time));
                this.addActivityItem(stats.lastMessage);
            } else {
                lastActivityElement.textContent = 'No messages yet';
            }

            // Update status
            const statusElement = document.getElementById('status-text');
            const statusDot = document.querySelector('.status-dot');
            
            if (stats.status === 'online') {
                statusElement.textContent = 'Online';
                statusDot.className = 'status-dot online';
            } else {
                statusElement.textContent = 'Offline';
                statusDot.className = 'status-dot offline';
            }

        } catch (error) {
            console.error('Error updating stats:', error);
            
            // Show offline status
            document.getElementById('status-text').textContent = 'Offline';
            document.querySelector('.status-dot').className = 'status-dot offline';
        }
    }

    addActivityItem(message) {
        const activityFeed = document.getElementById('activity-feed');
        const existingItems = activityFeed.querySelectorAll('.activity-item');
        
        // Remove old items if there are too many
        if (existingItems.length > 10) {
            existingItems[existingItems.length - 1].remove();
        }

        // Check if this message is already displayed
        const messageText = message.text.substring(0, 30) + (message.text.length > 30 ? '...' : '');
        const existingMessage = Array.from(existingItems).find(item => 
            item.querySelector('.activity-title').textContent.includes(messageText)
        );

        if (!existingMessage) {
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';
            activityItem.innerHTML = `
                <div class="activity-icon">💬</div>
                <div class="activity-content">
                    <div class="activity-title">New message: "${messageText}"</div>
                    <div class="activity-time">${this.formatTimeAgo(new Date(message.time))}</div>
                </div>
            `;

            // Insert at the beginning
            const firstChild = activityFeed.firstChild;
            if (firstChild && firstChild.className === 'activity-item') {
                activityFeed.insertBefore(activityItem, firstChild);
            } else {
                activityFeed.appendChild(activityItem);
            }
        }
    }

    formatUptime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else {
            return `${minutes}m`;
        }
    }

    formatTimeAgo(date) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) {
            return 'Just now';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours} hour${hours === 1 ? '' : 's'} ago`;
        } else {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days} day${days === 1 ? '' : 's'} ago`;
        }
    }

    updateStartTime() {
        const startTimeElement = document.getElementById('start-time');
        if (startTimeElement) {
            startTimeElement.textContent = new Date().toLocaleString();
        }
    }

    startAutoRefresh() {
        // Update stats every 5 seconds
        setInterval(() => {
            this.updateStats();
        }, 5000);

        // Update relative times every 30 seconds
        setInterval(() => {
            const timeElements = document.querySelectorAll('.activity-time');
            timeElements.forEach(element => {
                if (element.dataset.timestamp) {
                    const date = new Date(element.dataset.timestamp);
                    element.textContent = this.formatTimeAgo(date);
                }
            });
        }, 30000);
    }
}

// Add some interactive effects
document.addEventListener('DOMContentLoaded', () => {
    new Dashboard();

    // Add click animations to cards
    const cards = document.querySelectorAll('.stat-card, .card');
    cards.forEach(card => {
        card.addEventListener('click', function() {
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });

    // Add copy functionality to code elements
    const codeElements = document.querySelectorAll('code');
    codeElements.forEach(code => {
        code.addEventListener('click', async function() {
            try {
                await navigator.clipboard.writeText(this.textContent);
                
                const originalText = this.textContent;
                this.textContent = 'Copied!';
                this.style.background = '#10b981';
                this.style.color = 'white';
                
                setTimeout(() => {
                    this.textContent = originalText;
                    this.style.background = '';
                    this.style.color = '';
                }, 1000);
            } catch (err) {
                console.error('Failed to copy:', err);
            }
        });
        
        code.title = 'Click to copy';
        code.style.cursor = 'pointer';
    });
});

// Add CSS for offline status
const style = document.createElement('style');
style.textContent = `
    .status-dot.offline {
        background: #ef4444;
    }
    
    .activity-item {
        animation: slideIn 0.5s ease-out;
    }
    
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(-20px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
`;
document.head.appendChild(style);
