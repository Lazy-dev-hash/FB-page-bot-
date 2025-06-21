
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Facebook Page Access Token and Verify Token (to be set in Secrets)
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'educational_bot_verify_123';

// Bot statistics
let botStats = {
  totalMessages: 0,
  questionsAnswered: 0,
  popularTopics: {},
  startTime: new Date(),
  activeUsers: new Set()
};

// Enhanced Educational Knowledge Base
const educationalKnowledge = {
  mathematics: {
    keywords: ['math', 'calculate', 'equation', 'algebra', 'geometry', 'calculus', 'trigonometry', 'statistics', 'probability', 'number', 'formula', 'theorem', 'pythagoras', 'quadratic', 'integral', 'derivative', 'solve', 'fraction', 'percentage'],
    responses: {
      'pythagorean theorem': '🔺 **Pythagorean Theorem**\n\n**Formula:** a² + b² = c²\n\n**Where:**\n• a & b = legs of right triangle\n• c = hypotenuse (longest side)\n\n**Example:** If a=3 and b=4\nc = √(3² + 4²) = √(9 + 16) = √25 = 5\n\n💡 **Fun Fact:** This theorem was known 1000 years before Pythagoras!',
      
      'quadratic formula': '📊 **Quadratic Formula**\n\n**Formula:** x = (-b ± √(b²-4ac)) / 2a\n\n**For equations:** ax² + bx + c = 0\n\n**Discriminant (b²-4ac):**\n• > 0: Two real solutions\n• = 0: One real solution\n• < 0: No real solutions\n\n💡 **Memory trick:** "Negative b, plus or minus..."',
      
      'algebra': '🔢 **Algebra Fundamentals**\n\n**Key Concepts:**\n• Variables represent unknown values\n• Balance equations (same operation both sides)\n• **Order of Operations:** PEMDAS\n  - Parentheses\n  - Exponents\n  - Multiplication/Division\n  - Addition/Subtraction\n\n💡 **Practice tip:** Start with simple equations!',
      
      'geometry': '📐 **Geometry Essentials**\n\n**Areas:**\n• Rectangle: l × w\n• Triangle: ½ × base × height\n• Circle: πr²\n\n**Volumes:**\n• Cube: side³\n• Cylinder: πr²h\n\n**Angles:**\n• Triangle sum: 180°\n• Quadrilateral sum: 360°\n\n💡 **Visual learning:** Always draw diagrams!',
      
      'percentage': '📈 **Percentage Calculations**\n\n**Formula:** (Part/Whole) × 100 = %\n\n**Examples:**\n• 25 out of 100 = 25%\n• Increase: New-Old/Old × 100\n• Decrease: Old-New/Old × 100\n\n💡 **Quick tip:** 10% = divide by 10!'
    }
  },
  
  science: {
    keywords: ['science', 'physics', 'chemistry', 'biology', 'atom', 'molecule', 'cell', 'gravity', 'photosynthesis', 'evolution', 'dna', 'periodic table', 'force', 'energy', 'ecosystem', 'newton', 'einstein'],
    responses: {
      'photosynthesis': '🌱 **Photosynthesis: Nature\'s Solar Power**\n\n**Equation:**\n6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂\n\n**Process:**\n• **Location:** Chloroplasts in leaves\n• **Input:** CO₂, water, sunlight\n• **Output:** Glucose, oxygen\n• **Importance:** Produces all our oxygen!\n\n💡 **Amazing fact:** One tree produces oxygen for 2 people per day!',
      
      'atom': '⚛️ **Atomic Structure: Building Blocks of Matter**\n\n**Components:**\n• **Nucleus:** Protons (+) and Neutrons (0)\n• **Electrons:** Orbit nucleus (-)\n• **Atomic number:** = Number of protons\n• **Mass number:** = Protons + Neutrons\n\n**Scale:** If nucleus = marble, atom = football stadium!\n\n💡 **Mind-blowing:** Atoms are 99.9% empty space!',
      
      'gravity': '🌍 **Gravity: The Universal Force**\n\n**Newton\'s Law:**\nF = G(m₁m₂)/r²\n\n**Key Points:**\n• Universal attraction between masses\n• Stronger with more mass\n• Weaker with distance\n• Earth\'s acceleration: 9.8 m/s²\n\n**Einstein\'s Insight:** Gravity = curved spacetime\n\n💡 **Fun fact:** You weigh less on the Moon (1/6 Earth weight)!',
      
      'dna': '🧬 **DNA: The Code of Life**\n\n**Structure:**\n• Double helix (twisted ladder)\n• 4 bases: A, T, G, C\n• Base pairs: A-T, G-C\n• Contains genetic instructions\n\n**Facts:**\n• 3 billion base pairs in humans\n• 99.9% identical between humans\n• If stretched: 10 billion miles!\n\n💡 **Amazing:** Your DNA fits in a cell 50x smaller than hair width!',
      
      'evolution': '🐒➡️👨 **Evolution: Life\'s Greatest Story**\n\n**Darwin\'s Theory:**\n• Natural selection\n• Survival of the fittest\n• Gradual change over time\n• Common ancestry\n\n**Evidence:**\n• Fossil records\n• DNA similarities\n• Embryonic development\n\n💡 **Timeline:** Humans and chimps shared ancestor 6 million years ago!'
    }
  },
  
  history: {
    keywords: ['history', 'war', 'ancient', 'civilization', 'empire', 'revolution', 'independence', 'napoleon', 'caesar', 'egypt', 'greece', 'rome', 'medieval', 'renaissance', 'columbus', 'lincoln'],
    responses: {
      'ancient egypt': '🏺 **Ancient Egypt: Land of Pharaohs**\n\n**Timeline:** 3100-30 BCE (3000+ years!)\n\n**Achievements:**\n• Pyramids of Giza (Wonder of World)\n• Hieroglyphic writing\n• Mummification process\n• Advanced medicine\n• 365-day calendar\n\n**Famous Rulers:** Cleopatra, Tutankhamun, Ramses II\n\n💡 **Amazing:** Great Pyramid was world\'s tallest building for 3,800 years!',
      
      'world war 2': '⚔️ **World War II (1939-1945)**\n\n**Scale:** Largest conflict in human history\n\n**Key Events:**\n• Pearl Harbor (1941)\n• D-Day Normandy (1944)\n• Holocaust tragedy\n• Atomic bombs (1945)\n\n**Impact:**\n• 70+ million casualties\n• United Nations formed\n• Cold War began\n\n💡 **Turning point:** Changed the entire world order',
      
      'renaissance': '🎨 **Renaissance: Rebirth of Learning**\n\n**Period:** 14th-17th centuries\n\n**Key Figures:**\n• Leonardo da Vinci (artist/inventor)\n• Michelangelo (sculptor/painter)\n• Galileo (astronomer)\n• Shakespeare (playwright)\n\n**Innovations:**\n• Printing press\n• Scientific method\n• Perspective in art\n\n💡 **Legacy:** Bridge between medieval and modern worlds!',
      
      'american revolution': '🇺🇸 **American Revolution (1775-1783)**\n\n**Causes:**\n• "No taxation without representation"\n• Boston Tea Party\n• British colonial policies\n\n**Key Events:**\n• Declaration of Independence (1776)\n• Crossing Delaware\n• Valley Forge\n• Yorktown victory\n\n💡 **Result:** Birth of the United States of America!'
    }
  },
  
  literature: {
    keywords: ['literature', 'poetry', 'novel', 'shakespeare', 'author', 'book', 'story', 'character', 'plot', 'theme', 'metaphor', 'symbolism', 'hamlet', 'romeo'],
    responses: {
      'shakespeare': '🎭 **William Shakespeare: The Bard**\n\n**Life:** 1564-1616, Stratford-upon-Avon\n\n**Works:**\n• 39 plays\n• 154 sonnets\n• 1,700+ words he invented\n\n**Famous Plays:**\n• Hamlet ("To be or not to be")\n• Romeo & Juliet (star-crossed lovers)\n• Macbeth (ambition\'s tragedy)\n\n💡 **Legacy:** Still performed 400+ years later worldwide!',
      
      'metaphor': '🎨 **Metaphor: Language\'s Magic**\n\n**Definition:** Direct comparison without "like/as"\n\n**Examples:**\n• "Life is a journey"\n• "Time is money"\n• "Her voice is music"\n\n**vs. Simile:** Uses "like/as"\n• "Brave as a lion"\n\n**Purpose:** Creates vivid imagery and deeper meaning\n\n💡 **Shakespeare\'s famous:** "All the world\'s a stage"',
      
      'poetry': '📝 **Poetry: Language\'s Rhythm**\n\n**Elements:**\n• Rhyme scheme\n• Meter/rhythm\n• Imagery\n• Metaphors\n• Alliteration\n\n**Types:**\n• Sonnet (14 lines)\n• Haiku (5-7-5 syllables)\n• Free verse\n\n💡 **Fun fact:** Poetry is the oldest form of literature!'
    }
  },
  
  geography: {
    keywords: ['geography', 'country', 'capital', 'continent', 'ocean', 'mountain', 'river', 'climate', 'population', 'map', 'everest', 'sahara'],
    responses: {
      'continents': '🌍 **Seven Continents**\n\n1. **Asia** (largest, 60% of population)\n2. **Africa** (cradle of humanity)\n3. **North America** (includes Caribbean)\n4. **South America** (Amazon rainforest)\n5. **Antarctica** (coldest, no permanent residents)\n6. **Europe** (smallest by area)\n7. **Australia/Oceania** (smallest continent)\n\n💡 **Memory trick:** "A Ant And A Australian Ate Apples"',
      
      'oceans': '🌊 **Five Oceans of the World**\n\n1. **Pacific** (largest, covers 1/3 of Earth)\n2. **Atlantic** (S-shaped)\n3. **Indian** (warmest)\n4. **Southern/Antarctic** (surrounds Antarctica)\n5. **Arctic** (smallest, mostly frozen)\n\n**Facts:**\n• Cover 71% of Earth\'s surface\n• Contain 97% of Earth\'s water\n\n💡 **Amazing:** We\'ve explored less than 5% of our oceans!',
      
      'mount everest': '🏔️ **Mount Everest: Top of the World**\n\n**Height:** 8,848.86 meters (29,032 feet)\n**Location:** Nepal-Tibet border\n**First climbed:** 1953 (Hillary & Tenzing)\n\n**Challenges:**\n• Extreme altitude\n• Death zone above 8,000m\n• Harsh weather\n• Oxygen masks needed\n\n💡 **Growing:** Everest grows 4mm per year due to tectonic plates!'
    }
  },
  
  computerScience: {
    keywords: ['computer', 'programming', 'code', 'algorithm', 'software', 'hardware', 'internet', 'binary', 'data', 'artificial intelligence', 'ai'],
    responses: {
      'algorithm': '💻 **Algorithm: Computer\'s Recipe**\n\n**Definition:** Step-by-step problem-solving instructions\n\n**Properties:**\n• Clear and precise\n• Finite steps\n• Input/Output defined\n• Effective solution\n\n**Examples:**\n• Sorting numbers\n• Finding shortest path\n• Search engines\n\n**Efficiency:** Big O notation measures speed\n\n💡 **Real life:** Your GPS uses algorithms to find routes!',
      
      'binary': '🔢 **Binary: Computer\'s Language**\n\n**System:** Base-2 (only 0s and 1s)\n\n**Examples:**\n• 1 = 1\n• 2 = 10\n• 3 = 11\n• 4 = 100\n\n**Units:**\n• 8 bits = 1 byte\n• 1024 bytes = 1 kilobyte\n\n💡 **Joke:** "There are 10 types of people: those who understand binary and those who don\'t!"',
      
      'artificial intelligence': '🤖 **Artificial Intelligence: Machines That Think**\n\n**Types:**\n• **Narrow AI:** Specific tasks (Siri, chess)\n• **General AI:** Human-level intelligence\n• **Super AI:** Beyond human capability\n\n**Applications:**\n• Image recognition\n• Language translation\n• Medical diagnosis\n• Self-driving cars\n\n💡 **Current:** We\'re still in the Narrow AI phase!'
    }
  }
};

// Enhanced greeting messages
const greetingMessages = [
  "🎓 **Welcome to EduBot!** 📚\n\nI'm your AI learning companion, ready to explore knowledge together! ✨\n\n**I can help with:**\n📐 Mathematics • 🔬 Science • 📜 History\n📖 Literature • 🌍 Geography • 💻 Computer Science\n\n**Try asking:** \"What is photosynthesis?\" or \"Explain gravity\"\n\nWhat sparks your curiosity today? 🤔💡",
  
  "👋 **Hello, Future Scholar!** 🌟\n\nReady to unlock the mysteries of knowledge? I'm here to make learning fun and engaging! 🎯\n\n**Popular topics today:**\n• Pythagorean theorem\n• DNA structure\n• World War 2\n• Shakespeare\n\nWhat would you like to explore? 🚀",
  
  "🎯 **Hey there, Knowledge Seeker!** 📚\n\nEvery question is a doorway to discovery! I'm your friendly educational assistant, powered by curiosity and designed to help you learn! 🤖✨\n\n**Ask me anything educational!** No question is too basic or too complex. Let's learn together! 💪"
];

// Fun facts to share
const funFacts = [
  "🧠 Your brain has more connections than there are stars in the Milky Way!",
  "🐙 Octopuses have three hearts and blue blood!",
  "🌍 If you could fold a paper 42 times, it would reach the moon!",
  "⚡ Lightning is 5 times hotter than the surface of the Sun!",
  "🦈 Sharks have been around longer than trees!",
  "🍯 Honey never spoils - 3000-year-old honey is still edible!",
  "🧮 The word 'algorithm' comes from a 9th-century Persian mathematician!",
  "📚 Shakespeare invented over 1,700 words we still use today!"
];

// Enhanced webhook verification
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log('🔍 Webhook verification attempt...');
  
  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('✅ WEBHOOK_VERIFIED successfully!');
      res.status(200).send(challenge);
    } else {
      console.log('❌ Verification failed - incorrect token');
      res.sendStatus(403);
    }
  } else {
    console.log('❌ Missing required parameters');
    res.sendStatus(400);
  }
});

// Enhanced message handling
app.post('/webhook', async (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    await Promise.all(body.entry.map(async (entry) => {
      const webhookEvent = entry.messaging[0];
      console.log('📨 New message received');

      const senderPsid = webhookEvent.sender.id;
      botStats.activeUsers.add(senderPsid);
      
      if (webhookEvent.message) {
        botStats.totalMessages++;
        await handleMessage(senderPsid, webhookEvent.message);
      } else if (webhookEvent.postback) {
        await handlePostback(senderPsid, webhookEvent.postback);
      }
    }));

    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

// Enhanced message handler
async function handleMessage(senderPsid, receivedMessage) {
  let response;

  if (receivedMessage.text) {
    const userQuestion = receivedMessage.text.toLowerCase().trim();
    
    // Send typing indicator for better UX
    await sendTypingIndicator(senderPsid);
    
    // Realistic typing delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));
    
    try {
      // Check for special commands
      if (userQuestion.includes('fun fact') || userQuestion.includes('random fact')) {
        const randomFact = funFacts[Math.floor(Math.random() * funFacts.length)];
        response = { text: `🎲 **Random Fun Fact:**\n\n${randomFact}\n\nWant to learn more? Ask me any educational question! 📚` };
      } else if (userQuestion.includes('help') || userQuestion.includes('what can you do')) {
        response = { text: getHelpMessage() };
      } else {
        const educationalResponse = getEducationalAnswer(userQuestion);
        response = { text: educationalResponse };
        botStats.questionsAnswered++;
        
        // Track popular topics
        trackPopularTopic(userQuestion);
      }
    } catch (error) {
      console.error('❌ Error processing question:', error);
      response = {
        text: "🤔 Oops! I encountered a small glitch in my circuits! 🔧\n\nPlease try rephrasing your question or ask about a different topic. I'm here to help you learn! 💡✨"
      };
    }
  } else if (receivedMessage.attachments) {
    response = {
      text: "📎 I see you sent an attachment! While I can't process files yet, I'd love to help with any educational questions you have! Try asking about math, science, history, or any other subject! 🎓"
    };
  } else {
    const randomGreeting = greetingMessages[Math.floor(Math.random() * greetingMessages.length)];
    response = { text: randomGreeting };
  }

  await callSendAPI(senderPsid, response);
}

// Track popular topics for analytics
function trackPopularTopic(question) {
  for (const [category, data] of Object.entries(educationalKnowledge)) {
    const hasKeyword = data.keywords.some(keyword => question.includes(keyword));
    if (hasKeyword) {
      botStats.popularTopics[category] = (botStats.popularTopics[category] || 0) + 1;
      break;
    }
  }
}

// Enhanced educational answer generator
function getEducationalAnswer(question) {
  const questionLower = question.toLowerCase();
  
  // Check for greetings with personalized response
  const greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'];
  if (greetings.some(greeting => questionLower.includes(greeting))) {
    return greetingMessages[Math.floor(Math.random() * greetingMessages.length)];
  }
  
  // Search through all categories with enhanced matching
  for (const [category, data] of Object.entries(educationalKnowledge)) {
    const hasKeyword = data.keywords.some(keyword => questionLower.includes(keyword));
    
    if (hasKeyword) {
      // Look for specific topics with fuzzy matching
      for (const [topic, answer] of Object.entries(data.responses)) {
        const topicWords = topic.toLowerCase().split(' ');
        const hasAllWords = topicWords.every(word => questionLower.includes(word));
        const hasPartialMatch = topicWords.some(word => questionLower.includes(word));
        
        if (hasAllWords || (topicWords.length === 1 && hasPartialMatch)) {
          return `${answer}\n\n🔗 **Related topics:** ${getRelatedTopics(category)}\n\n💬 **Have more questions?** Just ask!`;
        }
      }
      
      // Category overview with enhanced suggestions
      return getEnhancedCategoryOverview(category);
    }
  }
  
  // Enhanced fallback with suggestions
  return `🤖 **Great question!** I'm your educational assistant specializing in academic topics! 📚

🎯 **I can help with:**

📐 **Mathematics** - equations, geometry, calculus, statistics
🔬 **Science** - physics, chemistry, biology, earth science  
📜 **History** - civilizations, wars, historical figures
📖 **Literature** - authors, poetry, literary analysis
🌍 **Geography** - countries, continents, natural features
💻 **Computer Science** - programming, algorithms, AI

🌟 **Try these popular questions:**
• "What is the Pythagorean theorem?"
• "Explain photosynthesis"
• "Tell me about Shakespeare"
• "How does gravity work?"
• "What are the continents?"

💡 **Pro tip:** Ask "fun fact" for amazing random knowledge!

What would you like to explore? 🚀`;
}

// Get related topics for cross-learning
function getRelatedTopics(category) {
  const related = {
    mathematics: "algebra, geometry, statistics, calculus",
    science: "physics, chemistry, biology, astronomy", 
    history: "ancient civilizations, wars, historical figures",
    literature: "poetry, novels, literary devices, authors",
    geography: "continents, countries, physical features",
    computerScience: "algorithms, programming, AI, data structures"
  };
  return related[category] || "various educational topics";
}

// Enhanced category overview
function getEnhancedCategoryOverview(category) {
  const overviews = {
    mathematics: "📐 **Mathematics: The Language of the Universe** 🔢\n\n🎯 **I can explain:**\n• Algebra & equations\n• Geometry & shapes  \n• Calculus concepts\n• Statistics & probability\n• Number theory\n\n✨ **Popular questions:**\n• \"What is the Pythagorean theorem?\"\n• \"Explain quadratic formula\"\n• \"How do percentages work?\"\n\n💡 **Fun fact:** Math is everywhere - from music to art to nature!",
    
    science: "🔬 **Science: Unlocking Nature's Secrets** ⚛️\n\n🎯 **I can explore:**\n• Physics laws & forces\n• Chemistry reactions  \n• Biology & life processes\n• Earth & space science\n\n✨ **Popular questions:**\n• \"What is photosynthesis?\"\n• \"How do atoms work?\"\n• \"Explain gravity\"\n• \"What is DNA?\"\n\n💡 **Amazing:** Science helps us understand everything from tiny atoms to massive galaxies!",
    
    history: "📜 **History: Lessons from the Past** 🏛️\n\n🎯 **I can discuss:**\n• Ancient civilizations\n• Important wars & conflicts\n• Historical figures & leaders\n• Cultural movements\n\n✨ **Popular questions:**\n• \"Tell me about ancient Egypt\"\n• \"What was World War 2?\"\n• \"Who was Napoleon?\"\n\n💡 **Wisdom:** Those who don't learn history are doomed to repeat it!",
    
    literature: "📖 **Literature: Stories That Shape Us** ✨\n\n🎯 **I can explore:**\n• Famous authors & their works\n• Poetry & literary devices\n• Classic novels & plays\n• Literary analysis techniques\n\n✨ **Popular questions:**\n• \"Who was Shakespeare?\"\n• \"What is a metaphor?\"\n• \"Explain poetry types\"\n\n💡 **Magic:** Literature lets us live a thousand lives through stories!",
    
    geography: "🌍 **Geography: Our Amazing Planet** 🗺️\n\n🎯 **I can teach about:**\n• Continents & countries\n• Oceans & mountains\n• Climate & weather patterns\n• Population & cultures\n\n✨ **Popular questions:**\n• \"What are the continents?\"\n• \"Tell me about oceans\"\n• \"How tall is Mount Everest?\"\n\n💡 **Wonder:** Our planet has infinite diversity and beauty to explore!",
    
    computerScience: "💻 **Computer Science: Building the Future** 🚀\n\n🎯 **I can explain:**\n• Programming concepts\n• Algorithms & data structures\n• Artificial intelligence\n• How computers work\n\n✨ **Popular questions:**\n• \"What is an algorithm?\"\n• \"Explain binary code\"\n• \"What is AI?\"\n\n💡 **Future:** Code is the new literacy of the digital age!"
  };
  
  return overviews[category] || "🎓 I'm here to help you learn! Ask me about any educational topic! 📚";
}

// Help message
function getHelpMessage() {
  return `🤖 **EduBot Help Center** 📚

🎯 **What I can do:**
• Answer educational questions across multiple subjects
• Provide detailed explanations with examples
• Share fun facts and interesting trivia
• Help with homework and study topics

📝 **How to ask questions:**
• Be specific: "Explain photosynthesis" vs "biology question"
• Try different phrasings if needed
• Ask follow-up questions for more details

🎲 **Special commands:**
• "fun fact" - Get amazing random trivia
• "help" - Show this help message

🌟 **Pro tips:**
• I explain complex topics in simple terms
• All information is educational and age-appropriate
• Feel free to ask for clarification anytime

Ready to learn something amazing? 🚀`;
}

// Enhanced typing indicator
async function sendTypingIndicator(senderPsid) {
  const requestBody = {
    recipient: { id: senderPsid },
    sender_action: "typing_on"
  };

  try {
    await axios.post(`https://graph.facebook.com/v17.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, requestBody);
  } catch (error) {
    console.error('❌ Error sending typing indicator:', error.message);
  }
}

// Enhanced message sending with error handling
async function callSendAPI(senderPsid, response) {
  const requestBody = {
    recipient: { id: senderPsid },
    message: response
  };

  try {
    const result = await axios.post(`https://graph.facebook.com/v17.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, requestBody);
    console.log('✅ Message sent successfully');
    return result.data;
  } catch (error) {
    console.error('❌ Error sending message:', error.response?.data || error.message);
    
    // Retry mechanism for failed messages
    if (error.response?.status === 429) {
      console.log('⏳ Rate limited, retrying in 2 seconds...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      return callSendAPI(senderPsid, response);
    }
    
    throw error;
  }
}

// Handle postback events
async function handlePostback(senderPsid, receivedPostback) {
  const payload = receivedPostback.payload;
  
  let response;
  switch(payload) {
    case 'GET_STARTED':
      response = { text: greetingMessages[0] };
      break;
    default:
      response = { text: "Thanks for interacting! What would you like to learn about? 📚" };
  }
  
  await callSendAPI(senderPsid, response);
}

// Enhanced dashboard with real-time stats
app.get('/', (req, res) => {
  const uptime = new Date() - botStats.startTime;
  const uptimeHours = Math.floor(uptime / (1000 * 60 * 60));
  const uptimeMinutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
  
  const topTopics = Object.entries(botStats.popularTopics)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>EduBot Dashboard - Educational Facebook Bot</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
                min-height: 100vh;
                color: white;
                padding: 20px;
            }
            
            .dashboard {
                max-width: 1200px;
                margin: 0 auto;
            }
            
            .header {
                text-align: center;
                margin-bottom: 40px;
                background: rgba(255,255,255,0.1);
                backdrop-filter: blur(20px);
                border-radius: 20px;
                padding: 30px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            }
            
            .header h1 {
                font-size: 3em;
                margin-bottom: 10px;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
                background: linear-gradient(45deg, #fff, #f0f0f0);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            
            .status-badge {
                display: inline-block;
                background: #4CAF50;
                color: white;
                padding: 8px 20px;
                border-radius: 25px;
                font-weight: bold;
                margin: 10px 0;
                box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
            }
            
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }
            
            .stat-card {
                background: rgba(255,255,255,0.15);
                backdrop-filter: blur(10px);
                border-radius: 15px;
                padding: 25px;
                text-align: center;
                transition: transform 0.3s ease, box-shadow 0.3s ease;
                border: 1px solid rgba(255,255,255,0.2);
            }
            
            .stat-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            }
            
            .stat-number {
                font-size: 2.5em;
                font-weight: bold;
                margin-bottom: 10px;
                background: linear-gradient(45deg, #FFD700, #FFA500);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            
            .features-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 20px;
                margin: 30px 0;
            }
            
            .feature-card {
                background: rgba(255,255,255,0.1);
                backdrop-filter: blur(10px);
                border-radius: 15px;
                padding: 25px;
                transition: transform 0.3s ease;
                border-left: 4px solid #FFD700;
            }
            
            .feature-card:hover {
                transform: translateX(5px);
            }
            
            .feature-emoji {
                font-size: 2.5em;
                margin-bottom: 15px;
                display: block;
            }
            
            .webhook-section {
                background: rgba(0,0,0,0.3);
                border-radius: 15px;
                padding: 25px;
                margin: 30px 0;
                border: 2px solid rgba(255,255,255,0.2);
            }
            
            .webhook-url {
                background: rgba(0,0,0,0.4);
                padding: 15px;
                border-radius: 10px;
                font-family: 'Courier New', monospace;
                word-break: break-all;
                margin: 10px 0;
                border-left: 4px solid #00BCD4;
            }
            
            .setup-checklist {
                background: rgba(255, 193, 7, 0.2);
                border: 2px solid #FFC107;
                border-radius: 15px;
                padding: 25px;
                margin: 20px 0;
            }
            
            .checklist-item {
                display: flex;
                align-items: center;
                margin: 10px 0;
                padding: 8px;
                border-radius: 8px;
                background: rgba(255,255,255,0.1);
            }
            
            .popular-topics {
                background: rgba(255,255,255,0.1);
                border-radius: 15px;
                padding: 25px;
                margin: 20px 0;
            }
            
            .topic-bar {
                background: rgba(255,255,255,0.2);
                height: 30px;
                border-radius: 15px;
                margin: 10px 0;
                overflow: hidden;
                position: relative;
            }
            
            .topic-fill {
                height: 100%;
                background: linear-gradient(90deg, #4CAF50, #45a049);
                border-radius: 15px;
                transition: width 0.3s ease;
            }
            
            .topic-label {
                position: absolute;
                left: 15px;
                top: 50%;
                transform: translateY(-50%);
                font-weight: bold;
                color: white;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.7);
            }
            
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }
            
            .pulse {
                animation: pulse 2s infinite;
            }
            
            .footer {
                text-align: center;
                margin-top: 40px;
                opacity: 0.8;
            }
        </style>
    </head>
    <body>
        <div class="dashboard">
            <div class="header">
                <h1>🎓 EduBot Dashboard</h1>
                <p style="font-size: 1.2em; margin: 10px 0;">Your AI Educational Assistant</p>
                <div class="status-badge pulse">🟢 Online & Ready</div>
            </div>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-number">${botStats.totalMessages}</div>
                    <div>Total Messages</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${botStats.questionsAnswered}</div>
                    <div>Questions Answered</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${botStats.activeUsers.size}</div>
                    <div>Active Users</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${uptimeHours}h ${uptimeMinutes}m</div>
                    <div>Uptime</div>
                </div>
            </div>
            
            ${topTopics.length > 0 ? `
            <div class="popular-topics">
                <h2>📊 Popular Topics Today</h2>
                ${topTopics.map(([topic, count], index) => {
                  const maxCount = Math.max(...Object.values(botStats.popularTopics));
                  const percentage = (count / maxCount) * 100;
                  return `
                    <div class="topic-bar">
                        <div class="topic-fill" style="width: ${percentage}%"></div>
                        <div class="topic-label">${topic.charAt(0).toUpperCase() + topic.slice(1)} (${count})</div>
                    </div>
                  `;
                }).join('')}
            </div>
            ` : ''}
            
            <div class="features-grid">
                <div class="feature-card">
                    <span class="feature-emoji">📐</span>
                    <h3>Mathematics</h3>
                    <p>Algebra, Geometry, Calculus, Statistics, and more mathematical concepts explained clearly</p>
                </div>
                <div class="feature-card">
                    <span class="feature-emoji">🔬</span>
                    <h3>Science</h3>
                    <p>Physics, Chemistry, Biology, and Earth Science topics with detailed explanations</p>
                </div>
                <div class="feature-card">
                    <span class="feature-emoji">📜</span>
                    <h3>History</h3>
                    <p>Ancient civilizations, important events, and historical figures from around the world</p>
                </div>
                <div class="feature-card">
                    <span class="feature-emoji">📖</span>
                    <h3>Literature</h3>
                    <p>Famous authors, literary devices, poetry analysis, and classic works</p>
                </div>
                <div class="feature-card">
                    <span class="feature-emoji">🌍</span>
                    <h3>Geography</h3>
                    <p>Countries, continents, physical features, and geographical phenomena</p>
                </div>
                <div class="feature-card">
                    <span class="feature-emoji">💻</span>
                    <h3>Computer Science</h3>
                    <p>Programming concepts, algorithms, AI, and technology fundamentals</p>
                </div>
            </div>
            
            <div class="webhook-section">
                <h2>🔗 Facebook Webhook Configuration</h2>
                <p><strong>Webhook URL:</strong></p>
                <div class="webhook-url">${req.protocol}://${req.get('host')}/webhook</div>
                <p><strong>Verify Token:</strong> Use the token set in your VERIFY_TOKEN secret</p>
                <p><strong>Webhook Events:</strong> messages, messaging_postbacks</p>
            </div>
            
            <div class="setup-checklist">
                <h2>⚙️ Setup Checklist</h2>
                <div class="checklist-item">
                    <span style="margin-right: 10px;">📝</span>
                    Set <strong>PAGE_ACCESS_TOKEN</strong> in Replit Secrets
                </div>
                <div class="checklist-item">
                    <span style="margin-right: 10px;">🔐</span>
                    Set <strong>VERIFY_TOKEN</strong> in Replit Secrets
                </div>
                <div class="checklist-item">
                    <span style="margin-right: 10px;">🔗</span>
                    Configure Facebook App webhook URL
                </div>
                <div class="checklist-item">
                    <span style="margin-right: 10px;">📱</span>
                    Test the bot in Messenger
                </div>
            </div>
            
            <div class="footer">
                <p>🤖 EduBot is ready to help students learn and grow! 🌟</p>
                <p>Built with ❤️ for education</p>
            </div>
        </div>
        
        <script>
            // Auto-refresh stats every 30 seconds
            setTimeout(() => {
                location.reload();
            }, 30000);
        </script>
    </body>
    </html>
  `);
});

// Enhanced API endpoint for bot stats
app.get('/api/stats', (req, res) => {
  const uptime = new Date() - botStats.startTime;
  res.json({
    ...botStats,
    activeUsers: botStats.activeUsers.size,
    uptime: uptime,
    status: 'online'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: new Date() - botStats.startTime,
    version: '2.0.0'
  });
});

// Enhanced server startup
app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 ========================================');
  console.log('🎓 EduBot v2.0 - Educational Assistant');
  console.log('🚀 ========================================');
  console.log(`📍 Server running on port: ${PORT}`);
  console.log(`🌐 Dashboard: http://localhost:${PORT}`);
  console.log('📋 Features enabled:');
  console.log('   ✅ Enhanced educational knowledge base');
  console.log('   ✅ Beautiful message formatting');
  console.log('   ✅ Real-time analytics dashboard');
  console.log('   ✅ No external API dependencies');
  console.log('   ✅ Improved error handling');
  console.log('   ✅ Fun facts and interactive learning');
  console.log('📝 Setup requirements:');
  console.log('   ⚙️  Set PAGE_ACCESS_TOKEN in Secrets');
  console.log('   ⚙️  Set VERIFY_TOKEN in Secrets');
  console.log('🎯 Ready to educate students worldwide!');
  console.log('🚀 ========================================');
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully...');
  process.exit(0);
});
