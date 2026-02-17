// Customer Support Chat Widget
// Include this file in any page to add the chat widget

(function() {
    // Add CSS
    const style = document.createElement('style');
    style.textContent = `
        /* Chat Widget Button */
        .chat-widget-button {
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
            transition: all 0.3s ease;
            z-index: 9998;
        }

        .chat-widget-button:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 30px rgba(102, 126, 234, 0.6);
        }

        .chat-widget-button i {
            color: white;
            font-size: 1.8rem;
        }

        .chat-badge {
            position: absolute;
            top: -5px;
            right: -5px;
            background: #e74c3c;
            color: white;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.75rem;
            font-weight: 600;
            border: 2px solid white;
        }

        /* Chat Widget Container */
        .chat-widget-container {
            position: fixed;
            bottom: 100px;
            right: 30px;
            width: 380px;
            height: 600px;
            background: white;
            border-radius: 20px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
            display: none;
            flex-direction: column;
            z-index: 9999;
            animation: slideUp 0.3s ease;
        }

        .chat-widget-container.active {
            display: flex;
        }

        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        /* Chat Header */
        .chat-header {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 20px;
            border-radius: 20px 20px 0 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .chat-header-info {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .agent-avatar {
            width: 45px;
            height: 45px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.3rem;
        }

        .agent-details h4 {
            font-size: 1rem;
            font-weight: 600;
            margin-bottom: 3px;
        }

        .status-online {
            font-size: 0.8rem;
            display: flex;
            align-items: center;
            gap: 5px;
            opacity: 0.9;
        }

        .status-online i {
            font-size: 0.6rem;
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }

        .chat-header-actions {
            display: flex;
            gap: 10px;
        }

        .minimize-btn,
        .close-btn {
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
        }

        .minimize-btn:hover,
        .close-btn:hover {
            background: rgba(255, 255, 255, 0.3);
        }

        /* Chat Body */
        .chat-body {
            flex: 1;
            padding: 20px;
            overflow-y: auto;
            background: #f8f9fa;
        }

        .chat-body::-webkit-scrollbar {
            width: 6px;
        }

        .chat-body::-webkit-scrollbar-track {
            background: #f1f1f1;
        }

        .chat-body::-webkit-scrollbar-thumb {
            background: #667eea;
            border-radius: 3px;
        }

        /* Messages */
        .message {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
            animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .message-avatar {
            width: 35px;
            height: 35px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 0.9rem;
            flex-shrink: 0;
        }

        .message-content {
            flex: 1;
        }

        .message-bubble {
            background: white;
            padding: 12px 16px;
            border-radius: 15px 15px 15px 5px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
            margin-bottom: 5px;
        }

        .message-bubble p {
            margin: 0;
            color: #2c3e50;
            font-size: 0.9rem;
            line-height: 1.5;
        }

        .message-time {
            font-size: 0.75rem;
            color: #999;
            padding-left: 5px;
        }

        /* User Message */
        .user-message {
            flex-direction: row-reverse;
        }

        .user-message .message-avatar {
            background: #2c3e50;
        }

        .user-message .message-bubble {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            border-radius: 15px 15px 5px 15px;
        }

        .user-message .message-bubble p {
            color: white;
        }

        .user-message .message-time {
            text-align: right;
            padding-right: 5px;
        }

        /* Quick Actions */
        .quick-actions {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-top: 15px;
        }

        .quick-action-btn {
            background: white;
            border: 2px solid #e9ecef;
            padding: 12px;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            font-size: 0.85rem;
            color: #2c3e50;
            font-weight: 500;
        }

        .quick-action-btn:hover {
            border-color: #667eea;
            background: #f8f9ff;
            transform: translateY(-2px);
        }

        .quick-action-btn i {
            font-size: 1.5rem;
            color: #667eea;
        }

        /* Chat Footer */
        .chat-footer {
            padding: 15px 20px;
            background: white;
            border-top: 1px solid #e9ecef;
            border-radius: 0 0 20px 20px;
        }

        .chat-input-container {
            display: flex;
            gap: 10px;
            align-items: center;
            margin-bottom: 8px;
        }

        .attach-btn {
            background: none;
            border: none;
            color: #667eea;
            font-size: 1.2rem;
            cursor: pointer;
            padding: 8px;
            transition: all 0.3s ease;
        }

        .attach-btn:hover {
            color: #764ba2;
        }

        .chat-input {
            flex: 1;
            padding: 12px 16px;
            border: 2px solid #e9ecef;
            border-radius: 25px;
            font-family: 'Poppins', sans-serif;
            font-size: 0.9rem;
            transition: all 0.3s ease;
        }

        .chat-input:focus {
            outline: none;
            border-color: #667eea;
        }

        .send-btn {
            background: linear-gradient(135deg, #667eea, #764ba2);
            border: none;
            color: white;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
        }

        .send-btn:hover {
            transform: scale(1.1);
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }

        .chat-footer-info {
            text-align: center;
        }

        .chat-footer-info small {
            color: #999;
            font-size: 0.75rem;
        }

        /* Typing Indicator */
        .typing-indicator {
            display: flex;
            gap: 4px;
            padding: 12px 16px;
        }

        .typing-dot {
            width: 8px;
            height: 8px;
            background: #999;
            border-radius: 50%;
            animation: typing 1.4s infinite;
        }

        .typing-dot:nth-child(2) {
            animation-delay: 0.2s;
        }

        .typing-dot:nth-child(3) {
            animation-delay: 0.4s;
        }

        @keyframes typing {
            0%, 60%, 100% {
                transform: translateY(0);
            }
            30% {
                transform: translateY(-10px);
            }
        }

        /* Responsive */
        @media (max-width: 768px) {
            .chat-widget-container {
                width: 100%;
                height: 100%;
                bottom: 0;
                right: 0;
                border-radius: 0;
            }

            .chat-header {
                border-radius: 0;
            }

            .chat-footer {
                border-radius: 0;
            }

            .chat-widget-button {
                bottom: 20px;
                right: 20px;
            }
        }
    `;
    document.head.appendChild(style);

    // Add HTML
    const chatHTML = `
        <!-- Chat Widget Button -->
        <div class="chat-widget-button" id="chatWidgetButton">
            <i class="fas fa-comments"></i>
            <span class="chat-badge" id="chatBadge" style="display: none;">1</span>
        </div>

        <!-- Chat Widget Container -->
        <div class="chat-widget-container" id="chatWidgetContainer">
            <!-- Chat Header -->
            <div class="chat-header">
                <div class="chat-header-info">
                    <div class="agent-avatar">
                        <i class="fas fa-headset"></i>
                    </div>
                    <div class="agent-details">
                        <h4>Customer Support</h4>
                        <span class="status-online"><i class="fas fa-circle"></i> Online</span>
                    </div>
                </div>
                <div class="chat-header-actions">
                    <button class="minimize-btn" id="minimizeChat">
                        <i class="fas fa-minus"></i>
                    </button>
                    <button class="close-btn" id="closeChat">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>

            <!-- Chat Body -->
            <div class="chat-body" id="chatBody">
                <!-- Welcome Message -->
                <div class="message bot-message">
                    <div class="message-avatar">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div class="message-content">
                        <div class="message-bubble">
                            <p>Hi! 👋 Welcome to PYRAMID Support!</p>
                            <p>How can we help you today?</p>
                        </div>
                        <span class="message-time">Just now</span>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="quick-actions" id="quickActions">
                    <button class="quick-action-btn" onclick="window.ChatWidget.selectQuickAction('track')">
                        <i class="fas fa-shipping-fast"></i>
                        Track Order
                    </button>
                    <button class="quick-action-btn" onclick="window.ChatWidget.selectQuickAction('return')">
                        <i class="fas fa-undo"></i>
                        Return Product
                    </button>
                    <button class="quick-action-btn" onclick="window.ChatWidget.selectQuickAction('payment')">
                        <i class="fas fa-credit-card"></i>
                        Payment Issue
                    </button>
                    <button class="quick-action-btn" onclick="window.ChatWidget.selectQuickAction('other')">
                        <i class="fas fa-question-circle"></i>
                        Other Query
                    </button>
                </div>
            </div>

            <!-- Chat Footer -->
            <div class="chat-footer">
                <div class="chat-input-container">
                    <button class="attach-btn" title="Attach file">
                        <i class="fas fa-paperclip"></i>
                    </button>
                    <input 
                        type="text" 
                        class="chat-input" 
                        id="chatInput" 
                        placeholder="Type your message..."
                    >
                    <button class="send-btn" id="sendBtn">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
                <div class="chat-footer-info">
                    <small>We typically reply within minutes</small>
                </div>
            </div>
        </div>
    `;

    // Add to body when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            document.body.insertAdjacentHTML('beforeend', chatHTML);
            initChatWidget();
        });
    } else {
        document.body.insertAdjacentHTML('beforeend', chatHTML);
        initChatWidget();
    }

    function initChatWidget() {
        const chatButton = document.getElementById('chatWidgetButton');
        const chatContainer = document.getElementById('chatWidgetContainer');
        const closeBtn = document.getElementById('closeChat');
        const minimizeBtn = document.getElementById('minimizeChat');
        const chatInput = document.getElementById('chatInput');
        const sendBtn = document.getElementById('sendBtn');
        const chatBody = document.getElementById('chatBody');
        const chatBadge = document.getElementById('chatBadge');

        // Toggle chat
        chatButton.addEventListener('click', () => {
            chatContainer.classList.toggle('active');
            if (chatContainer.classList.contains('active')) {
                chatInput.focus();
                chatBadge.style.display = 'none';
            }
        });

        // Close chat
        closeBtn.addEventListener('click', () => {
            chatContainer.classList.remove('active');
        });

        // Minimize chat
        minimizeBtn.addEventListener('click', () => {
            chatContainer.classList.remove('active');
        });

        // Send message on Enter
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });

        // Send message on button click
        sendBtn.addEventListener('click', sendMessage);

        function sendMessage() {
            const message = chatInput.value.trim();
            if (!message) return;

            addMessage(message, 'user');
            chatInput.value = '';

            showTypingIndicator();

            setTimeout(() => {
                hideTypingIndicator();
                const response = getBotResponse(message);
                addMessage(response, 'bot');
            }, 1500);
        }

        function addMessage(text, sender) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${sender}-message`;

            const time = new Date().toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });

            messageDiv.innerHTML = `
                <div class="message-avatar">
                    <i class="fas fa-${sender === 'user' ? 'user' : 'robot'}"></i>
                </div>
                <div class="message-content">
                    <div class="message-bubble">
                        <p>${text}</p>
                    </div>
                    <span class="message-time">${time}</span>
                </div>
            `;

            const quickActions = document.getElementById('quickActions');
            if (quickActions && sender === 'user') {
                quickActions.remove();
            }

            chatBody.appendChild(messageDiv);
            chatBody.scrollTop = chatBody.scrollHeight;
        }

        function showTypingIndicator() {
            const typingDiv = document.createElement('div');
            typingDiv.className = 'message bot-message';
            typingDiv.id = 'typingIndicator';
            typingDiv.innerHTML = `
                <div class="message-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="message-content">
                    <div class="message-bubble">
                        <div class="typing-indicator">
                            <div class="typing-dot"></div>
                            <div class="typing-dot"></div>
                            <div class="typing-dot"></div>
                        </div>
                    </div>
                </div>
            `;
            chatBody.appendChild(typingDiv);
            chatBody.scrollTop = chatBody.scrollHeight;
        }

        function hideTypingIndicator() {
            const typingIndicator = document.getElementById('typingIndicator');
            if (typingIndicator) {
                typingIndicator.remove();
            }
        }

        function getBotResponse(message) {
            const lowerMessage = message.toLowerCase();

            if (lowerMessage.includes('track') || lowerMessage.includes('order')) {
                return 'To track your order, please visit the Orders page or provide your order ID. You can also check your email for tracking information.';
            } else if (lowerMessage.includes('return') || lowerMessage.includes('refund')) {
                return 'You can return products within 7 days of delivery. Visit our Customer Care page to submit a return request, or I can help you with that now!';
            } else if (lowerMessage.includes('payment') || lowerMessage.includes('pay')) {
                return 'We accept all major credit/debit cards, UPI, net banking, and COD. If you\'re facing payment issues, please try a different payment method or contact your bank.';
            } else if (lowerMessage.includes('delivery') || lowerMessage.includes('shipping')) {
                return 'Standard delivery takes 3-5 business days. Express delivery (available in select cities) takes 1-2 business days. Free shipping on orders above ₹999!';
            } else if (lowerMessage.includes('cancel')) {
                return 'You can cancel your order before it ships from the Orders page. If it has already shipped, you can return it after delivery.';
            } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
                return 'Hello! How can I assist you today? Feel free to ask about orders, returns, payments, or anything else!';
            } else if (lowerMessage.includes('thank')) {
                return 'You\'re welcome! Is there anything else I can help you with? 😊';
            } else {
                return 'Thank you for your message! For immediate assistance, please visit our Customer Care page or call us at 1800-XXX-XXXX. Our team is available 24/7!';
            }
        }

        // Expose functions globally
        window.ChatWidget = {
            selectQuickAction: function(action) {
                const quickActions = document.getElementById('quickActions');
                if (quickActions) {
                    quickActions.remove();
                }

                let message = '';
                switch(action) {
                    case 'track':
                        message = 'I want to track my order';
                        break;
                    case 'return':
                        message = 'I want to return a product';
                        break;
                    case 'payment':
                        message = 'I have a payment issue';
                        break;
                    case 'other':
                        message = 'I have a different question';
                        break;
                }

                addMessage(message, 'user');
                
                showTypingIndicator();
                setTimeout(() => {
                    hideTypingIndicator();
                    const response = getBotResponse(message);
                    addMessage(response, 'bot');
                }, 1500);
            }
        };

        // Show notification badge after 3 seconds
        setTimeout(() => {
            if (!chatContainer.classList.contains('active')) {
                chatBadge.style.display = 'flex';
            }
        }, 3000);
    }
})();
