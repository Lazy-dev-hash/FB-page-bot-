
<old_str>
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const OpenAI = require('openai');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Facebook Page Access Token and Verify Token (to be set in Secrets)
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'your_verify_token_123';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

// Webhook verification
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

// Handle incoming messages
app.post('/webhook', async (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    body.entry.forEach(async (entry) => {
      const webhookEvent = entry.messaging[0];
      console.log('Webhook event:', webhookEvent);

      const senderPsid = webhookEvent.sender.id;
      
      if (webhookEvent.message) {
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
    const userQuestion = receivedMessage.text;
    
    // Send typing indicator
    await sendTypingIndicator(senderPsid);
    
    try {
      // Get AI response for educational question
      const aiResponse = await getEducationalAnswer(userQuestion);
      
      response = {
        text: aiResponse
      };
    } catch (error) {
      console.error('Error getting AI response:', error);
      response = {
        text: "I'm sorry, I'm having trouble processing your question right now. Please try again later."
      };
    }
  } else {
    response = {
      text: "Hello! I'm an educational bot. Feel free to ask me any question about subjects like math, science, history, literature, or any other educational topic!"
    };
  }

  await callSendAPI(senderPsid, response);
}

// Get educational answer from OpenAI
async function getEducationalAnswer(question) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an educational assistant bot. Your purpose is to help students learn by answering educational questions across various subjects including:
          - Mathematics (algebra, geometry, calculus, statistics)
          - Science (physics, chemistry, biology, earth science)
          - History (world history, specific periods, historical figures)
          - Literature (analysis, authors, literary devices)
          - Geography (countries, capitals, physical features)
          - Language arts (grammar, writing, vocabulary)
          - Computer science and technology
          - Economics and social studies
          
          Guidelines:
          - Provide clear, accurate, and educational explanations
          - Use simple language appropriate for students
          - Include examples when helpful
          - Encourage learning and curiosity
          - If the question is not educational, politely redirect to educational topics
          - Keep responses concise but informative (under 2000 characters for Facebook Messenger)
          - For complex topics, break down explanations into digestible parts`
        },
        {
          role: "user",
          content: question
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    let answer = completion.choices[0].message.content;
    
    // Ensure response fits Facebook Messenger limits (2000 characters)
    if (answer.length > 1900) {
      answer = answer.substring(0, 1900) + "... (Message was truncated. Ask for more details if needed!)";
    }
    
    return answer;
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw error;
  }
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
    await axios.post(`https://graph.facebook.com/v17.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, requestBody);
  } catch (error) {
    console.error('Error sending typing indicator:', error);
  }
}

// Send message to Facebook
async function callSendAPI(senderPsid, response) {
  const requestBody = {
    recipient: {
      id: senderPsid
    },
    message: response
  };

  try {
    const result = await axios.post(`https://graph.facebook.com/v17.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, requestBody);
    console.log('Message sent successfully:', result.data);
  } catch (error) {
    console.error('Error sending message:', error.response?.data || error.message);
  }
}

// Health check endpoint
app.get('/', (req, res) => {
  res.send(`
    <h1>Facebook Educational Bot</h1>
    <p>Bot is running successfully!</p>
    <p>This bot can answer educational questions on various topics including:</p>
    <ul>
      <li>Mathematics</li>
      <li>Science</li>
      <li>History</li>
      <li>Literature</li>
      <li>Geography</li>
      <li>Computer Science</li>
      <li>And much more!</li>
    </ul>
    <p>Webhook URL: <code>${req.protocol}://${req.get('host')}/webhook</code></p>
  `);
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Educational Facebook Bot is running on port ${PORT}`);
  console.log('Make sure to set the following environment variables:');
  console.log('- PAGE_ACCESS_TOKEN');
  console.log('- VERIFY_TOKEN');
  console.log('- OPENAI_API_KEY');
});
</old_str>
<new_str>
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Facebook Page Access Token and Verify Token (to be set in Secrets)
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'educational_bot_verify_123';

// Educational Knowledge Base
const educationalKnowledge = {
  // Mathematics
  mathematics: {
    keywords: ['math', 'calculate', 'equation', 'algebra', 'geometry', 'calculus', 'trigonometry', 'statistics', 'probability', 'number', 'formula', 'theorem', 'pythagoras', 'quadratic', 'integral', 'derivative', 'solve'],
    responses: {
      'pythagorean theorem': '📐 **Pythagorean Theorem**\n\na² + b² = c²\n\nWhere:\n• a & b = legs of right triangle\n• c = hypotenuse (longest side)\n\n💡 Example: If a=3 and b=4, then c=√(9+16)=5',
      'quadratic formula': '📊 **Quadratic Formula**\n\nx = (-b ± √(b²-4ac)) / 2a\n\nFor equations: ax² + bx + c = 0\n\n💡 Remember: The discriminant (b²-4ac) tells us about the nature of roots!',
      'algebra': '🔢 **Algebra Basics**\n\n• Variables represent unknown numbers\n• Balance equations by doing same operation to both sides\n• PEMDAS: Parentheses, Exponents, Multiplication/Division, Addition/Subtraction\n\n💡 Practice with simple equations first!',
      'geometry': '📐 **Geometry Fundamentals**\n\n• Area of rectangle: length × width\n• Area of circle: πr²\n• Volume of cube: side³\n• Angles in triangle sum to 180°\n\n💡 Draw diagrams to visualize problems!'
    }
  },
  
  // Science
  science: {
    keywords: ['science', 'physics', 'chemistry', 'biology', 'atom', 'molecule', 'cell', 'gravity', 'photosynthesis', 'evolution', 'dna', 'periodic table', 'force', 'energy', 'ecosystem'],
    responses: {
      'photosynthesis': '🌱 **Photosynthesis Process**\n\n6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂\n\n• Plants convert sunlight into glucose\n• Occurs in chloroplasts\n• Produces oxygen as byproduct\n\n💡 This process feeds almost all life on Earth!',
      'atom': '⚛️ **Atomic Structure**\n\n• **Nucleus**: Contains protons (+) and neutrons (0)\n• **Electrons**: Orbit the nucleus (-)\n• **Atomic number**: Number of protons\n\n💡 Atoms are 99.9% empty space!',
      'gravity': '🌍 **Gravity Explained**\n\nF = G(m₁m₂)/r²\n\n• Universal force of attraction\n• Depends on mass and distance\n• Keeps planets in orbit\n• Acceleration on Earth: 9.8 m/s²\n\n💡 Einstein showed it\'s curved spacetime!',
      'dna': '🧬 **DNA Structure**\n\n• Double helix structure\n• Made of 4 bases: A, T, G, C\n• A pairs with T, G pairs with C\n• Contains genetic instructions\n\n💡 If unraveled, your DNA would stretch 10 billion miles!'
    }
  },
  
  // History
  history: {
    keywords: ['history', 'war', 'ancient', 'civilization', 'empire', 'revolution', 'independence', 'napoleon', 'caesar', 'egypt', 'greece', 'rome', 'medieval', 'renaissance'],
    responses: {
      'ancient egypt': '🏺 **Ancient Egypt**\n\n• Lasted over 3000 years (3100-30 BCE)\n• Built pyramids and sphinx\n• Pharaohs were god-kings\n• Invented hieroglyphics\n• Mummification for afterlife\n\n💡 The Great Pyramid was the tallest building for 3800 years!',
      'world war 2': '⚔️ **World War II (1939-1945)**\n\n• Global conflict involving 30+ countries\n• Axis vs Allies\n• Holocaust: Systematic persecution\n• Ended with atomic bombs on Japan\n\n💡 Led to formation of United Nations for peace',
      'renaissance': '🎨 **Renaissance (14th-17th century)**\n\n• "Rebirth" of art, science, culture\n• Leonardo da Vinci, Michelangelo\n• Scientific revolution began\n• Printing press invented\n\n💡 Bridge between medieval and modern times!'
    }
  },
  
  // Literature
  literature: {
    keywords: ['literature', 'poetry', 'novel', 'shakespeare', 'author', 'book', 'story', 'character', 'plot', 'theme', 'metaphor', 'symbolism'],
    responses: {
      'shakespeare': '📚 **William Shakespeare**\n\n• Greatest English playwright (1564-1616)\n• Wrote 39 plays, 154 sonnets\n• Famous works: Hamlet, Romeo & Juliet, Macbeth\n• Invented 1700+ words we still use\n\n💡 "To be or not to be" - Hamlet\'s famous soliloquy!',
      'metaphor': '🎭 **Literary Metaphor**\n\n• Compares two unlike things directly\n• "Life is a journey" (life ≠ journey literally)\n• Creates vivid imagery\n• Different from simile (uses "like/as")\n\n💡 Helps readers understand complex ideas!'
    }
  },
  
  // Geography
  geography: {
    keywords: ['geography', 'country', 'capital', 'continent', 'ocean', 'mountain', 'river', 'climate', 'population', 'map'],
    responses: {
      'continents': '🌍 **Seven Continents**\n\n1. Asia (largest)\n2. Africa\n3. North America\n4. South America\n5. Antarctica\n6. Europe\n7. Australia/Oceania\n\n💡 Asia contains 60% of world\'s population!',
      'oceans': '🌊 **Five Oceans**\n\n1. Pacific (largest)\n2. Atlantic\n3. Indian\n4. Southern\n5. Arctic (smallest)\n\n💡 Oceans cover 71% of Earth\'s surface!'
    }
  },
  
  // Computer Science
  computerScience: {
    keywords: ['computer', 'programming', 'code', 'algorithm', 'software', 'hardware', 'internet', 'binary', 'data'],
    responses: {
      'algorithm': '💻 **Algorithm Basics**\n\n• Step-by-step problem-solving process\n• Must be precise and finite\n• Examples: sorting, searching\n• Big O notation measures efficiency\n\n💡 Like a recipe for computers!',
      'binary': '🔢 **Binary System**\n\n• Uses only 0s and 1s\n• Base-2 number system\n• Computers understand only binary\n• 8 bits = 1 byte\n\n💡 "There are 10 types of people: those who understand binary and those who don\'t!"'
    }
  }
};

// Greeting messages
const greetingMessages = [
  "🎓 Hello! I'm your **Educational Assistant**! 📚\n\nI can help you learn about:\n• 📐 Mathematics\n• 🔬 Science\n• 📜 History\n• 📖 Literature\n• 🌍 Geography\n• 💻 Computer Science\n\nAsk me anything educational! 🤔",
  "👋 Welcome back, scholar! 🌟\n\nReady to explore the world of knowledge? I'm here to help with any educational questions! 🎯",
  "🎯 Hey there, learner! 📚\n\nWhat would you like to discover today? I'm your friendly educational companion! 🤖✨"
];

// Webhook verification
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('✅ WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

// Handle incoming messages
app.post('/webhook', async (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    body.entry.forEach(async (entry) => {
      const webhookEvent = entry.messaging[0];
      console.log('📨 Webhook event received');

      const senderPsid = webhookEvent.sender.id;
      
      if (webhookEvent.message) {
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
    const userQuestion = receivedMessage.text.toLowerCase();
    
    // Send typing indicator
    await sendTypingIndicator(senderPsid);
    
    // Add delay for more natural feel
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      const educationalResponse = getEducationalAnswer(userQuestion);
      response = { text: educationalResponse };
    } catch (error) {
      console.error('❌ Error processing question:', error);
      response = {
        text: "🤔 Hmm, I'm having a moment of confusion! Please try rephrasing your question or ask about a different topic. I'm here to help! 💡"
      };
    }
  } else {
    const randomGreeting = greetingMessages[Math.floor(Math.random() * greetingMessages.length)];
    response = { text: randomGreeting };
  }

  await callSendAPI(senderPsid, response);
}

// Get educational answer from knowledge base
function getEducationalAnswer(question) {
  const questionLower = question.toLowerCase();
  
  // Check for greetings
  if (questionLower.includes('hello') || questionLower.includes('hi') || questionLower.includes('hey')) {
    return greetingMessages[Math.floor(Math.random() * greetingMessages.length)];
  }
  
  // Search through all categories
  for (const [category, data] of Object.entries(educationalKnowledge)) {
    // Check if question contains category keywords
    const hasKeyword = data.keywords.some(keyword => questionLower.includes(keyword));
    
    if (hasKeyword) {
      // Look for specific topic in responses
      for (const [topic, answer] of Object.entries(data.responses)) {
        if (questionLower.includes(topic.toLowerCase())) {
          return answer;
        }
      }
      
      // If keyword found but no specific topic, give category overview
      return getCategoryOverview(category);
    }
  }
  
  // If no match found, provide helpful guidance
  return `🤖 I'd love to help you learn! 📚

I specialize in educational topics like:

📐 **Mathematics** - algebra, geometry, calculus
🔬 **Science** - physics, chemistry, biology  
📜 **History** - ancient civilizations, wars, figures
📖 **Literature** - authors, poetry, analysis
🌍 **Geography** - countries, continents, features
💻 **Computer Science** - programming, algorithms

Try asking about any of these topics! For example:
• "What is photosynthesis?"
• "Explain the Pythagorean theorem"
• "Tell me about Shakespeare"

What would you like to learn about? 🎯`;
}

// Get category overview
function getCategoryOverview(category) {
  const overviews = {
    mathematics: "📐 **Mathematics is Everywhere!** 🔢\n\nI can help with:\n• Algebra & equations\n• Geometry & shapes\n• Calculus concepts\n• Statistics basics\n\nTry asking: 'What is the Pythagorean theorem?' or 'Explain quadratic formula'",
    
    science: "🔬 **Science Unlocks the Universe!** ⚛️\n\nI can explain:\n• Physics laws\n• Chemistry reactions\n• Biology processes\n• Earth science\n\nTry asking: 'What is photosynthesis?' or 'How do atoms work?'",
    
    history: "📜 **History Shapes Our World!** 🏛️\n\nI can discuss:\n• Ancient civilizations\n• Important wars\n• Historical figures\n• Cultural movements\n\nTry asking: 'Tell me about ancient Egypt' or 'What was the Renaissance?'",
    
    literature: "📖 **Literature Enriches the Soul!** ✨\n\nI can explore:\n• Famous authors\n• Literary devices\n• Classic works\n• Poetry analysis\n\nTry asking: 'Who was Shakespeare?' or 'What is a metaphor?'",
    
    geography: "🌍 **Geography Maps Our World!** 🗺️\n\nI can teach about:\n• Continents & countries\n• Physical features\n• Climate patterns\n• Population facts\n\nTry asking: 'What are the continents?' or 'Tell me about oceans'",
    
    computerScience: "💻 **Technology Powers the Future!** 🚀\n\nI can explain:\n• Programming basics\n• Algorithm concepts\n• Computer systems\n• Internet technology\n\nTry asking: 'What is an algorithm?' or 'Explain binary code'"
  };
  
  return overviews[category] || "🎓 I'm here to help you learn! Ask me about any educational topic! 📚";
}

// Send typing indicator
async function sendTypingIndicator(senderPsid) {
  const requestBody = {
    recipient: { id: senderPsid },
    sender_action: "typing_on"
  };

  try {
    await axios.post(`https://graph.facebook.com/v17.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, requestBody);
  } catch (error) {
    console.error('❌ Error sending typing indicator:', error);
  }
}

// Send message to Facebook
async function callSendAPI(senderPsid, response) {
  const requestBody = {
    recipient: { id: senderPsid },
    message: response
  };

  try {
    const result = await axios.post(`https://graph.facebook.com/v17.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, requestBody);
    console.log('✅ Message sent successfully');
  } catch (error) {
    console.error('❌ Error sending message:', error.response?.data || error.message);
  }
}

// Health check endpoint with beautiful design
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Educational Facebook Bot</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                margin: 0;
                padding: 20px;
                min-height: 100vh;
                color: white;
            }
            .container {
                max-width: 800px;
                margin: 0 auto;
                background: rgba(255,255,255,0.1);
                backdrop-filter: blur(10px);
                border-radius: 20px;
                padding: 40px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            }
            h1 {
                text-align: center;
                font-size: 2.5em;
                margin-bottom: 10px;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            }
            .subtitle {
                text-align: center;
                font-size: 1.2em;
                margin-bottom: 30px;
                opacity: 0.9;
            }
            .status {
                background: rgba(76, 175, 80, 0.3);
                border: 2px solid #4CAF50;
                border-radius: 10px;
                padding: 15px;
                text-align: center;
                margin-bottom: 30px;
                font-weight: bold;
            }
            .features {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                margin: 30px 0;
            }
            .feature {
                background: rgba(255,255,255,0.1);
                border-radius: 15px;
                padding: 20px;
                text-align: center;
                transition: transform 0.3s ease;
            }
            .feature:hover {
                transform: translateY(-5px);
            }
            .emoji {
                font-size: 2em;
                margin-bottom: 10px;
                display: block;
            }
            .webhook-info {
                background: rgba(0,0,0,0.2);
                border-radius: 10px;
                padding: 20px;
                margin-top: 30px;
                font-family: monospace;
                word-break: break-all;
            }
            .setup-note {
                background: rgba(255, 193, 7, 0.3);
                border: 2px solid #FFC107;
                border-radius: 10px;
                padding: 15px;
                margin-top: 20px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🎓 Educational Facebook Bot</h1>
            <p class="subtitle">Your AI-powered learning companion</p>
            
            <div class="status">
                ✅ Bot is running successfully!
            </div>
            
            <div class="features">
                <div class="feature">
                    <span class="emoji">📐</span>
                    <h3>Mathematics</h3>
                    <p>Algebra, Geometry, Calculus, Statistics</p>
                </div>
                <div class="feature">
                    <span class="emoji">🔬</span>
                    <h3>Science</h3>
                    <p>Physics, Chemistry, Biology, Earth Science</p>
                </div>
                <div class="feature">
                    <span class="emoji">📜</span>
                    <h3>History</h3>
                    <p>Ancient Civilizations, Wars, Historical Figures</p>
                </div>
                <div class="feature">
                    <span class="emoji">📖</span>
                    <h3>Literature</h3>
                    <p>Authors, Poetry, Literary Analysis</p>
                </div>
                <div class="feature">
                    <span class="emoji">🌍</span>
                    <h3>Geography</h3>
                    <p>Countries, Continents, Physical Features</p>
                </div>
                <div class="feature">
                    <span class="emoji">💻</span>
                    <h3>Computer Science</h3>
                    <p>Programming, Algorithms, Technology</p>
                </div>
            </div>
            
            <div class="webhook-info">
                <strong>📡 Webhook URL:</strong><br>
                ${req.protocol}://${req.get('host')}/webhook
            </div>
            
            <div class="setup-note">
                <strong>⚙️ Setup Required:</strong><br>
                Make sure to set PAGE_ACCESS_TOKEN and VERIFY_TOKEN in your Secrets tab!
            </div>
        </div>
    </body>
    </html>
  `);
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 Educational Facebook Bot is running!');
  console.log(`📍 Port: ${PORT}`);
  console.log('📋 Setup checklist:');
  console.log('   ✅ Built-in educational knowledge base');
  console.log('   ✅ Aesthetic message formatting');
  console.log('   ✅ No external API dependencies');
  console.log('   ⚙️  Set PAGE_ACCESS_TOKEN in Secrets');
  console.log('   ⚙️  Set VERIFY_TOKEN in Secrets');
  console.log('💡 Bot ready to educate students!');
});
</new_str>
