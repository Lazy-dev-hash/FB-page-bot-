
# 🤖 Facebook Page Bot with GPT-4

A sophisticated Facebook Messenger bot powered by OpenAI's GPT-4 with a beautiful web dashboard for monitoring and management.

## ✨ Features

- **GPT-4 Integration**: Intelligent responses using OpenAI's latest model
- **Real-time Dashboard**: Beautiful web interface with live statistics
- **Message Analytics**: Track messages, users, and bot performance
- **Webhook Support**: Secure Facebook Messenger integration
- **Responsive Design**: Mobile-friendly dashboard
- **Live Updates**: Real-time stats refresh automatically

## 🚀 Quick Setup

### 1. Environment Variables
Set up your secrets in Replit:

```bash
PAGE_ACCESS_TOKEN=your_facebook_page_access_token
VERIFY_TOKEN=your_webhook_verify_token
OPENAI_API_KEY=your_openai_api_key
```

### 2. Get Facebook Credentials
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or select existing
3. Add **Messenger** product
4. Generate Page Access Token
5. Note down your Page ID

### 3. Get OpenAI API Key
1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Create an API key
3. Ensure GPT-4 access is enabled

### 4. Deploy & Configure Webhook
1. Deploy your bot on Replit
2. Copy your deployment URL
3. In Facebook Developer Console:
   - Webhook URL: `https://your-deployment-url.com/webhook`
   - Verify Token: Your `VERIFY_TOKEN`
   - Subscribe to: `messages`

## 📊 Dashboard Features

Access your bot dashboard at your deployment URL to see:

- **Live Statistics**: Total messages, unique users, uptime
- **Recent Activity**: Real-time message feed
- **Setup Guide**: Step-by-step configuration help
- **Quick Links**: Direct access to developer tools
- **Health Monitoring**: Bot status and performance metrics

## 🛠 API Endpoints

- `GET /` - Dashboard interface
- `GET /webhook` - Facebook webhook verification
- `POST /webhook` - Message handling endpoint
- `GET /api/stats` - Statistics API
- `GET /health` - Health check endpoint

## 🎯 Bot Capabilities

The bot can:
- Respond intelligently to any text message
- Handle multiple conversation contexts
- Show typing indicators for better UX
- Process attachments (with appropriate responses)
- Maintain conversation history

## 🔧 Customization

### Modify Bot Personality
Edit the system prompt in `index.js`:

```javascript
{
  role: "system",
  content: "Your custom bot personality here..."
}
```

### Adjust Response Settings
Configure GPT-4 parameters:

```javascript
const completion = await openai.chat.completions.create({
  model: "gpt-4",
  max_tokens: 500,
  temperature: 0.7,
  // Add your custom parameters
});
```

## 📱 Mobile Support

The dashboard is fully responsive and works perfectly on:
- Desktop browsers
- Mobile phones
- Tablets
- Touch devices

## 🔒 Security Features

- Environment variable protection
- Webhook verification
- HTTPS enforcement
- Error handling and logging
- Rate limiting ready

## 🚨 Troubleshooting

### Common Issues

1. **Bot not responding**: Check PAGE_ACCESS_TOKEN and webhook configuration
2. **GPT-4 errors**: Verify OPENAI_API_KEY and billing status
3. **Webhook verification fails**: Ensure VERIFY_TOKEN matches Facebook settings

### Debug Mode
Check console logs in Replit for detailed error information.

## 📈 Scaling

This bot is designed for Replit's Autoscale deployment:
- Handles multiple concurrent users
- Automatic scaling based on traffic
- Optimized for serverless architecture

## 🎨 UI Customization

Modify `public/styles.css` to customize:
- Color schemes
- Layout components
- Animations
- Typography

## 📞 Support

For issues or questions:
1. Check the dashboard for real-time status
2. Review console logs in Replit
3. Verify all environment variables are set
4. Test with `/health` endpoint

---

**Made with ❤️ using Replit, GPT-4, and Facebook Messenger API**
