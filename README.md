# English Word Chain - Ultimate Edition v2.0

Ultimate word chain game with authentication, multiple game modes, vocabulary learning, achievements, challenges, statistics, and study modes.

## 🚀 What's New in v2.0

### ✨ Major Updates
- **User Authentication System** - Register/Login with unique usernames
- **Backend API** - Full-featured REST API with MongoDB
- **8 Game Modes** - Multiple ways to play and learn
- **Challenge System** - Daily, Weekly, and special challenges
- **Comprehensive Statistics** - Track your progress with detailed analytics
- **Study Modes** - Multiple learning tools including quizzes, flashcards, and more
- **Spaced Repetition System** - Intelligent vocabulary review scheduling

## 🎮 Game Modes

### 1. VS AI (Classic)
- Play against AI opponent
- 3 difficulty levels (Easy, Medium, Hard)
- 20-second timer per turn
- 3 attempts per game

### 2. Multiplayer Local
- 2 real players on same device
- No AI opponent
- Pass-and-play gameplay

### 3. Time Attack
- 60 seconds to use maximum words
- No turn limit
- Score based on word count

### 4. Survival Mode
- Play until you can't think of a word
- No time limit
- Progressively challenging

### 5. Practice Mode
- Unlimited time
- No attempts limit
- Perfect for learning

### 6. Endless Mode
- No win/lose conditions
- Just keep playing and scoring
- Zen mode for vocabulary practice

### 7. Chain Challenge
- Words must increase in length
- Start at 3 letters → 4 → 5 → 6...
- Test your vocabulary depth

### 8. Theme Mode
- Category-specific words only
- Themes: Animals, Food, Jobs, Nature, Technology, Sports
- Learn specialized vocabulary

## 🎯 Challenge System

### Daily Challenges
- New challenge every day
- Tasks like:
  - Use 5 words with 6+ letters
  - Win 3 games
  - Win 2 perfect games
  - Learn 10 new words
- Earn XP rewards

### Weekly Challenges
- Longer-term goals
- Higher XP rewards
- Examples:
  - Win 10 games this week
  - Learn 50 new words
  - Score 500+ in Time Attack

### Special Challenges
- **Word of the Day** - Use a specific difficult word
- **Letter Challenge** - Use 10 words starting with specific letter
- **Speed Challenge** - Answer in X seconds, multiple times
- **Achievement Challenges** - Unlock special achievements

## 📊 Statistics Dashboard

### Overall Stats
- Total games played
- Win/loss record and win rate
- Total play time
- Average game duration

### Performance Tracking
- **By Difficulty** - Win rates for Easy/Medium/Hard
- **By Game Mode** - Stats for each mode
- **Performance Chart** - Progress over last 30 days
- **Progress Calendar** - Visual calendar showing play days

### Word Analytics
- Total words used
- Unique words learned
- Longest/shortest words
- Average word length
- Most used words
- **Letter Frequency Analysis** - Most and least used starting letters

### Response Time Tracking
- Average response time
- Fastest/slowest responses
- Response time by difficulty

### Session History
- Detailed record of all games
- Scores, XP earned, duration
- Words used per session

## 📚 Study & Learning Modes

### 1. Quiz Mode
- Multiple choice questions
- Test definitions or word recognition
- Adjustable difficulty
- Instant feedback
- Track accuracy

### 2. Flashcard System
- Interactive flashcards
- Show word/definition/examples
- Study by categories (due, favorites, difficult)
- Swipe to next card

### 3. Spelling Test
- Listen to definition
- Type the correct spelling
- Check your accuracy
- Great for memorization

### 4. Pronunciation Practice
- Text-to-Speech for all words
- Listen and repeat
- Perfect your pronunciation
- Phonetic guides (IPA)

### 5. Word Association Game
- Link related words together
- Build vocabulary connections
- Fun and educational

### 6. Synonym/Antonym Quiz
- Test your knowledge of related words
- Multiple choice format
- Learn word relationships

### 7. Personalized Study Plan
- AI-generated daily plan
- Based on your progress
- Review recommendations
- Learning targets

### 8. Spaced Repetition System (SRS)
- Intelligent review scheduling
- SM-2 algorithm implementation
- Words scheduled at optimal intervals
- Tracks mastery level (0-5)
- Auto-adjusts based on performance

## 🏆 Achievements

11 unlockable achievements:
- **First Victory** - Win your first game (50 XP)
- **Hot Streak** - Win 3 games in a row (100 XP)
- **On Fire** - Win 5 games in a row (200 XP)
- **Unstoppable** - Win 10 games in a row (500 XP)
- **Word Collector** - Learn 50 unique words (75 XP)
- **Wordsmith** - Learn 100 unique words (150 XP)
- **Lexicon Master** - Learn 200 unique words (300 XP)
- **Sesquipedalian** - Use a word with 8+ letters (50 XP)
- **Speed Demon** - Win a game in under 3 minutes (100 XP)
- **Flawless** - Win without any mistakes (200 XP)
- **Hard Mode Master** - Win 10 games on hard difficulty (150 XP)

## 💾 Technology Stack

### Frontend
- HTML5, CSS3 (Tailwind CSS)
- Vanilla JavaScript (ES6+)
- Canvas Confetti for animations
- Modular architecture

### Backend
- Node.js + Express.js
- MongoDB + Mongoose ODM
- JWT authentication
- bcryptjs for password hashing
- RESTful API architecture

### External APIs
- Dictionary API - Word validation & definitions
- MyMemory Translation API - Vietnamese translations
- Datamuse API - Word suggestions

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 14+ and npm
- MongoDB 4.4+ (local or MongoDB Atlas)
- Modern web browser

### Backend Setup

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/wordchain
JWT_SECRET=your-secret-key-here
CLIENT_URL=http://localhost:8080
```

5. Start the server:
```bash
# Development mode with auto-reload
npm run dev

# OR Production mode
npm start
```

Server will start on `http://localhost:3000`

### Frontend Setup

1. Open `index.html` in a web browser, OR

2. Use a local web server (recommended):
```bash
# Using Python
python -m http.server 8080

# OR using npx
npx http-server -p 8080
```

3. Open `http://localhost:8080` in your browser

### First Time Use

1. Click "Đăng ký ngay" (Register Now)
2. Enter email, unique username, and password
3. Click "Đăng ký" to create account
4. Start playing!

## 📖 API Documentation

Full API documentation available at `/server/README.md`

### Main Endpoints

- **Authentication**: `/api/auth/*`
- **User Management**: `/api/users/*`
- **Games**: `/api/games/*`
- **Vocabulary**: `/api/vocabulary/*`
- **Challenges**: `/api/challenges/*`
- **Statistics**: `/api/statistics/*`
- **Study Modes**: `/api/study/*`

See [Server README](server/README.md) for complete API documentation.

## 🎨 Project Structure

```
Word_Chainn/
├── index.html              # Main application (with auth)
├── index-old.html          # Backup of original version
├── README.md               # This file
├── CHANGELOG.md            # Version history
├── css/
│   └── animations.css      # Custom animations
├── js/
│   ├── api.js             # API client for backend
│   ├── auth.js            # Authentication manager
│   ├── game.js            # Core game logic
│   ├── player.js          # Progress & achievements
│   ├── vocabulary.js      # Word management
│   ├── ui.js              # UI management
│   ├── audio.js           # Sound effects
│   └── animations.js      # Visual effects
└── server/                 # Backend API
    ├── package.json
    ├── server.js          # Main server file
    ├── .env               # Configuration (not in git)
    ├── .env.example       # Configuration template
    ├── config/
    │   └── database.js    # MongoDB connection
    ├── models/            # Database models
    │   ├── User.model.js
    │   ├── Game.model.js
    │   ├── Vocabulary.model.js
    │   ├── Challenge.model.js
    │   └── Statistics.model.js
    ├── controllers/       # Request handlers
    │   ├── auth.controller.js
    │   ├── user.controller.js
    │   ├── game.controller.js
    │   ├── vocabulary.controller.js
    │   ├── challenge.controller.js
    │   ├── statistics.controller.js
    │   └── study.controller.js
    ├── routes/            # API routes
    │   ├── auth.routes.js
    │   ├── user.routes.js
    │   ├── game.routes.js
    │   ├── vocabulary.routes.js
    │   ├── challenge.routes.js
    │   ├── statistics.routes.js
    │   └── study.routes.js
    └── middleware/
        └── auth.middleware.js
```

## 🎯 Features Implemented

### Core Features
- ✅ User authentication (register, login, JWT)
- ✅ Unique username system
- ✅ Profile management
- ✅ 8 different game modes
- ✅ Challenge system (daily, weekly, special)
- ✅ Comprehensive statistics tracking
- ✅ Multiple study modes
- ✅ Spaced repetition system
- ✅ Letter frequency analysis
- ✅ Performance charts
- ✅ Progress calendar
- ✅ Session history
- ✅ Leaderboard system

### Backend Features
- ✅ RESTful API with Express
- ✅ MongoDB database
- ✅ JWT authentication
- ✅ Password hashing with bcrypt
- ✅ Input validation
- ✅ Error handling
- ✅ CORS configuration
- ✅ Security headers (Helmet)

### Frontend Features
- ✅ Responsive design
- ✅ Authentication UI
- ✅ API integration
- ✅ Local storage migration to database
- ✅ Real-time updates
- ✅ Sound effects
- ✅ Animations
- ✅ Modal dialogs

## 🔜 Future Enhancements (Not Yet Implemented)

The following features have backend support but need frontend UI implementation:

1. **Game Mode Selection UI** - Interface to choose between 8 game modes
2. **Challenges Dashboard** - Visual dashboard for all challenges
3. **Statistics Dashboard** - Interactive charts and graphs
4. **Study Modes UI** - Complete interfaces for quiz, flashcards, etc.
5. **Leaderboard Display** - Global rankings
6. **Theme Mode Categories** - UI for selecting word categories
7. **Multiplayer Local UI** - Player 1 vs Player 2 interface
8. **Progress Calendar Visual** - Calendar view of play history

## 🐛 Troubleshooting

### Backend Issues

**MongoDB Connection Error**
- Ensure MongoDB is running (`mongod` or MongoDB service)
- Check `MONGODB_URI` in `.env` file
- For MongoDB Atlas, ensure IP is whitelisted

**Port Already in Use**
- Change `PORT` in `.env` file
- Or kill the process using port 3000

### Frontend Issues

**CORS Errors**
- Ensure backend `CLIENT_URL` matches frontend URL
- Check browser console for specific errors

**Authentication Fails**
- Clear browser localStorage
- Check network tab for API response errors
- Verify backend server is running

## 📝 Development Notes

### Data Migration
When you first log in with a new account, any vocabulary stored in localStorage will be automatically migrated to your server account.

### Local vs Server Storage
- Old version: All data in localStorage (browser-only)
- New version: All data on server (accessible from any device)

### Security
- Passwords are hashed with bcryptjs
- JWT tokens expire after 7 days
- All protected routes require authentication
- Input validation on both client and server

## 📄 License

MIT License - Feel free to use and modify

## 🙏 Credits

- Dictionary API: [dictionaryapi.dev](https://dictionaryapi.dev/)
- Translation API: [MyMemory](https://mymemory.translated.net/)
- Word Suggestions: [Datamuse API](https://www.datamuse.com/api/)
- Confetti: [canvas-confetti](https://www.npmjs.com/package/canvas-confetti)
- UI Framework: [Tailwind CSS](https://tailwindcss.com/)

## 📧 Support

For issues or questions, please check:
1. This README
2. Server README at `/server/README.md`
3. GitHub Issues

---

**Version 2.0** - Major update with authentication, backend API, multiple game modes, challenges, statistics, and study modes.
