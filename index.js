
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const OpenAI = require('openai');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Facebook Page Access Token and Verify Token
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || '@facebook_bot';

// OpenAI API Key
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

app.use(bodyParser.json());
app.use(express.static('public'));

// Statistics tracking
let stats = {
  totalMessages: 0,
  totalUsers: new Set(),
  lastMessage: null,
  startTime: new Date()
};

// Serve the main dashboard
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint for stats
app.get('/api/stats', (req, res) => {
  res.json({
    totalMessages: stats.totalMessages,
    totalUsers: stats.totalUsers.size,
    lastMessage: stats.lastMessage,
    uptime: Math.floor((new Date() - stats.startTime) / 1000),
    status: 'online'
  });
});

// Webhook verification endpoint
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

// Webhook event handler
app.post('/webhook', async (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    body.entry.forEach(async (entry) => {
      const webhookEvent = entry.messaging[0];
      console.log('Received webhook event:', webhookEvent);

      const senderPsid = webhookEvent.sender.id;

      if (webhookEvent.message) {
        // Update statistics
        stats.totalMessages++;
        stats.totalUsers.add(senderPsid);
        stats.lastMessage = {
          text: webhookEvent.message.text,
          time: new Date(),
          senderId: senderPsid
        };

        await handleMessage(senderPsid, webhookEvent.message);
      }
    });

    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

// Handle incoming messages
async function handleMessage(senderPsid, receivedMessage) {
  let response;

  if (receivedMessage.text) {
    try {
      // Send typing indicator
      await sendTypingIndicator(senderPsid);
      
      // Get AI response
      const aiResponse = await getGPTResponse(receivedMessage.text);
      
      response = {
        text: aiResponse
      };
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Provide specific error messages based on the error type
      let errorMessage = 'Sorry, I encountered an error processing your message. ';
      
      if (error.message.includes('API key')) {
        errorMessage += 'The AI service needs to be configured. Please contact support.';
      } else if (error.message.includes('rate limit')) {
        errorMessage += 'I\'m getting too many requests right now. Please try again in a moment.';
      } else if (error.message.includes('connection')) {
        errorMessage += 'I\'m having trouble connecting to my AI brain. Please try again later.';
      } else {
        errorMessage += 'Please try again in a moment, or rephrase your question.';
      }
      
      response = {
        text: errorMessage
      };
    }
  } else if (receivedMessage.attachments) {
    response = {
      text: '📎 I received your attachment! Currently, I can only respond to text messages, but I appreciate you sharing that with me. Try sending me a text question! 😊'
    };
  } else {
    response = {
      text: 'Hello! 👋 I\'m your educational AI assistant. I can help you with questions about various subjects. Just send me a text message! 📚✨'
    };
  }

  await callSendAPI(senderPsid, response);
}

// Send typing indicator
async function sendTypingIndicator(senderPsid) {
  const requestBody = {
    recipient: {
      id: senderPsid
    },
    sender_action: "typing_on"
  };

  try {
    await axios.post(`https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, requestBody);
  } catch (error) {
    console.error('Error sending typing indicator:', error);
  }
}

// Get response from OpenAI (using gpt-3.5-turbo for better availability)
async function getGPTResponse(userMessage) {
  try {
    // Check if OpenAI API key is configured
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Using gpt-3.5-turbo for better availability
      messages: [
        {
          role: "system",
          content: "You are a helpful, friendly, and engaging educational assistant for a Facebook page. Be conversational, helpful, and concise in your responses. Show personality while being professional. Help students with their questions about various subjects. Always be positive and encouraging."
        },
        {
          role: "user",
          content: userMessage
        }
      ],
      max_tokens: 400,
      temperature: 0.7,
      presence_penalty: 0.2,
      frequency_penalty: 0.1
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API error:', error);
    
    // Handle specific OpenAI errors
    if (error.status === 404) {
      throw new Error('AI model not accessible. Please check your OpenAI API key and model permissions.');
    } else if (error.status === 401) {
      throw new Error('Invalid OpenAI API key. Please check your API key configuration.');
    } else if (error.status === 429) {
      throw new Error('OpenAI API rate limit reached. Please try again later.');
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      throw new Error('Unable to connect to OpenAI API. Please check your internet connection.');
    } else {
      throw new Error('AI service temporarily unavailable. Please try again later.');
    }
  }
}

// Send message back to user
async function callSendAPI(senderPsid, response) {
  const requestBody = {
    recipient: {
      id: senderPsid
    },
    message: response
  };

  try {
    await axios.post(`https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, requestBody);
    console.log('Message sent successfully');
  } catch (error) {
    console.error('Error sending message:', error.response?.data || error.message);
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🤖 Facebook Bot Server running on port ${PORT}`);
  console.log(`📊 Dashboard available at: http://localhost:${PORT}`);
  console.log('🔧 Environment check:');
  console.log(`   PAGE_ACCESS_TOKEN: ${PAGE_ACCESS_TOKEN ? '✅ Set' : '❌ Missing'}`);
  console.log(`   VERIFY_TOKEN: ${VERIFY_TOKEN ? '✅ Set' : '❌ Missing'}`);
  console.log(`   OPENAI_API_KEY: ${OPENAI_API_KEY ? '✅ Set' : '❌ Missing'}`);
});
