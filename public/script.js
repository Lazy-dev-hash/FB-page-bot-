
class Dashboard {
    constructor() {
        this.initializeWebhookUrl();
        this.updateStats();
        this.startAutoRefresh();
        this.updateStartTime();
        this.initializeEducationalFeatures();
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

            // Update stat cards with animations
            this.animateCounter('total-messages', stats.totalMessages);
            this.animateCounter('total-users', stats.totalUsers);
            document.getElementById('uptime').textContent = this.formatUptime(stats.uptime);

            // Update last activity
            const lastActivityElement = document.getElementById('last-activity');
            if (stats.lastMessage) {
                lastActivityElement.textContent = this.formatTimeAgo(new Date(stats.lastMessage.time));
                this.addActivityItem(stats.lastMessage);
            } else {
                lastActivityElement.textContent = '🌟 Ready for learning!';
            }

            // Update status with enhanced visuals
            const statusElement = document.getElementById('status-text');
            const statusDot = document.querySelector('.status-dot');
            
            if (stats.status === 'online') {
                statusElement.textContent = '🟢 Bot is Learning!';
                statusDot.className = 'status-dot online';
            } else {
                statusElement.textContent = '🔴 Bot Offline';
                statusDot.className = 'status-dot offline';
            }

        } catch (error) {
            console.error('Error updating stats:', error);
            
            // Show offline status
            document.getElementById('status-text').textContent = '🔴 Connection Lost';
            document.querySelector('.status-dot').className = 'status-dot offline';
        }
    }

    animateCounter(elementId, targetValue) {
        const element = document.getElementById(elementId);
        const currentValue = parseInt(element.textContent.replace(/,/g, '')) || 0;
        
        if (currentValue === targetValue) return;
        
        const increment = targetValue > currentValue ? 1 : -1;
        const speed = Math.abs(targetValue - currentValue) > 10 ? 50 : 200;
        
        const timer = setInterval(() => {
            const current = parseInt(element.textContent.replace(/,/g, '')) || 0;
            if ((increment > 0 && current >= targetValue) || (increment < 0 && current <= targetValue)) {
                element.textContent = targetValue.toLocaleString();
                clearInterval(timer);
            } else {
                element.textContent = (current + increment).toLocaleString();
            }
        }, speed);
    }

    addActivityItem(message) {
        const activityFeed = document.getElementById('activity-feed');
        const existingItems = activityFeed.querySelectorAll('.activity-item');
        
        // Remove old items if there are too many
        if (existingItems.length > 15) {
            existingItems[existingItems.length - 1].remove();
        }

        // Check if this message is already displayed
        const messageText = message.text.substring(0, 40) + (message.text.length > 40 ? '...' : '');
        const existingMessage = Array.from(existingItems).find(item => 
            item.querySelector('.activity-title').textContent.includes(messageText)
        );

        if (!existingMessage) {
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';
            activityItem.innerHTML = `
                <div class="activity-icon">💭</div>
                <div class="activity-content">
                    <div class="activity-title">📚 Learning from: "${messageText}"</div>
                    <div class="activity-time" data-timestamp="${message.time}">${this.formatTimeAgo(new Date(message.time))}</div>
                </div>
            `;

            // Add entrance animation
            activityItem.style.opacity = '0';
            activityItem.style.transform = 'translateX(-30px)';
            
            // Insert at the beginning
            const firstChild = activityFeed.firstChild;
            if (firstChild && firstChild.className === 'activity-item') {
                activityFeed.insertBefore(activityItem, firstChild);
            } else {
                activityFeed.appendChild(activityItem);
            }

            // Trigger animation
            setTimeout(() => {
                activityItem.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                activityItem.style.opacity = '1';
                activityItem.style.transform = 'translateX(0)';
            }, 100);
        }
    }

    formatUptime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        if (hours > 0) {
            return `🕐 ${hours}h ${minutes}m`;
        } else {
            return `⏱️ ${minutes}m`;
        }
    }

    formatTimeAgo(date) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) {
            return '⚡ Just now';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `🕐 ${minutes} minute${minutes === 1 ? '' : 's'} ago`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `🕐 ${hours} hour${hours === 1 ? '' : 's'} ago`;
        } else {
            const days = Math.floor(diffInSeconds / 86400);
            return `📅 ${days} day${days === 1 ? '' : 's'} ago`;
        }
    }

    updateStartTime() {
        const startTimeElement = document.getElementById('start-time');
        if (startTimeElement) {
            startTimeElement.textContent = '🚀 ' + new Date().toLocaleString();
        }
    }

    initializeEducationalFeatures() {
        // Add floating learning particles
        this.createLearningParticles();
        
        // Add interactive hover effects
        this.addInteractiveEffects();
        
        // Add educational tips
        this.addEducationalTips();
    }

    createLearningParticles() {
        const particleContainer = document.createElement('div');
        particleContainer.style.position = 'fixed';
        particleContainer.style.top = '0';
        particleContainer.style.left = '0';
        particleContainer.style.width = '100%';
        particleContainer.style.height = '100%';
        particleContainer.style.pointerEvents = 'none';
        particleContainer.style.zIndex = '-1';
        document.body.appendChild(particleContainer);

        const particles = ['📚', '🎓', '💡', '⭐', '🧠', '📖', '✨', '🔬'];
        
        setInterval(() => {
            if (document.querySelectorAll('.learning-particle').length < 8) {
                const particle = document.createElement('div');
                particle.className = 'learning-particle';
                particle.innerHTML = particles[Math.floor(Math.random() * particles.length)];
                particle.style.position = 'absolute';
                particle.style.left = Math.random() * 100 + 'vw';
                particle.style.top = '100vh';
                particle.style.fontSize = '1.5em';
                particle.style.opacity = '0.6';
                particle.style.animation = 'floatUp 15s linear forwards';
                particle.style.zIndex = '-1';
                
                particleContainer.appendChild(particle);
                
                setTimeout(() => {
                    if (particle.parentNode) {
                        particle.parentNode.removeChild(particle);
                    }
                }, 15000);
            }
        }, 3000);
    }

    addInteractiveEffects() {
        // Add ripple effect to cards
        const cards = document.querySelectorAll('.stat-card, .card, .quick-link');
        cards.forEach(card => {
            card.addEventListener('click', this.createRippleEffect);
        });
        
        // Add glow effect on hover
        const statCards = document.querySelectorAll('.stat-card');
        statCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.boxShadow = `
                    0 30px 80px rgba(0, 0, 0, 0.12),
                    0 15px 35px rgba(102, 126, 234, 0.3),
                    0 0 40px rgba(102, 126, 234, 0.2),
                    inset 0 1px 0 rgba(255, 255, 255, 0.9)
                `;
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.boxShadow = '';
            });
        });
    }

    createRippleEffect(e) {
        const ripple = document.createElement('div');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.className = 'ripple-effect';
        
        this.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    addEducationalTips() {
        const tips = [
            "💡 Your bot learns from every conversation!",
            "🎓 Each message helps improve the AI's understanding",
            "📚 Monitor your bot's educational impact here",
            "⭐ Great conversations lead to great learning!",
            "🧠 AI + Education = Unlimited possibilities"
        ];
        
        let tipIndex = 0;
        const tipElement = document.createElement('div');
        tipElement.className = 'educational-tip';
        tipElement.style.position = 'fixed';
        tipElement.style.bottom = '20px';
        tipElement.style.right = '20px';
        tipElement.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
        tipElement.style.color = 'white';
        tipElement.style.padding = '15px 20px';
        tipElement.style.borderRadius = '25px';
        tipElement.style.fontSize = '0.9em';
        tipElement.style.fontWeight = '600';
        tipElement.style.boxShadow = '0 10px 30px rgba(102, 126, 234, 0.3)';
        tipElement.style.transform = 'translateY(100px)';
        tipElement.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        tipElement.style.zIndex = '1000';
        tipElement.style.maxWidth = '300px';
        tipElement.style.cursor = 'pointer';
        
        document.body.appendChild(tipElement);
        
        const showTip = () => {
            tipElement.textContent = tips[tipIndex];
            tipElement.style.transform = 'translateY(0)';
            
            setTimeout(() => {
                tipElement.style.transform = 'translateY(100px)';
            }, 4000);
            
            tipIndex = (tipIndex + 1) % tips.length;
        };
        
        // Show first tip after 3 seconds
        setTimeout(showTip, 3000);
        
        // Show new tip every 30 seconds
        setInterval(showTip, 30000);
        
        // Hide tip on click
        tipElement.addEventListener('click', () => {
            tipElement.style.transform = 'translateY(100px)';
        });
    }

    startAutoRefresh() {
        // Update stats every 3 seconds for more responsive feel
        setInterval(() => {
            this.updateStats();
        }, 3000);

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

// Enhanced DOM ready handler with educational flair
document.addEventListener('DOMContentLoaded', () => {
    new Dashboard();

    // Add enhanced click animations to cards
    const cards = document.querySelectorAll('.stat-card, .card');
    cards.forEach(card => {
        card.addEventListener('click', function() {
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });

    // Enhanced copy functionality with visual feedback
    const codeElements = document.querySelectorAll('code');
    codeElements.forEach(code => {
        code.addEventListener('click', async function() {
            try {
                await navigator.clipboard.writeText(this.textContent);
                
                const originalText = this.textContent;
                const originalBg = this.style.background;
                const originalColor = this.style.color;
                
                this.textContent = '✨ Copied!';
                this.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                this.style.color = 'white';
                this.style.transform = 'scale(1.1)';
                
                setTimeout(() => {
                    this.textContent = originalText;
                    this.style.background = originalBg;
                    this.style.color = originalColor;
                    this.style.transform = '';
                }, 2000);
            } catch (err) {
                console.error('Failed to copy:', err);
                this.textContent = '❌ Copy failed';
                setTimeout(() => {
                    this.textContent = this.getAttribute('data-original') || this.textContent;
                }, 1000);
            }
        });
        
        code.setAttribute('data-original', code.textContent);
        code.title = '🖱️ Click to copy';
        code.style.cursor = 'pointer';
    });

    // Add learning celebration animation
    let messageCount = 0;
    const originalUpdateStats = Dashboard.prototype.updateStats;
    
    // Add page load celebration
    setTimeout(() => {
        const celebration = document.createElement('div');
        celebration.innerHTML = '🎉🎓✨';
        celebration.style.position = 'fixed';
        celebration.style.top = '50%';
        celebration.style.left = '50%';
        celebration.style.transform = 'translate(-50%, -50%)';
        celebration.style.fontSize = '4em';
        celebration.style.zIndex = '10000';
        celebration.style.animation = 'celebrate 2s ease-out forwards';
        document.body.appendChild(celebration);
        
        setTimeout(() => {
            celebration.remove();
        }, 2000);
    }, 1000);
});

// Add CSS animations for educational features
const style = document.createElement('style');
style.textContent = `
    @keyframes floatUp {
        0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0.6;
        }
        50% {
            opacity: 0.8;
        }
        100% {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
        }
    }
    
    @keyframes celebrate {
        0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 0;
        }
        50% {
            transform: translate(-50%, -50%) scale(1.5);
            opacity: 1;
        }
        100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0;
        }
    }
    
    .ripple-effect {
        position: absolute;
        border-radius: 50%;
        background: rgba(102, 126, 234, 0.3);
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .educational-tip {
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
    }
    
    .learning-particle {
        animation: floatUp 15s linear forwards;
        pointer-events: none;
    }
`;
document.head.appendChild(style);
