# English Word Chain - Ultimate Edition

Ultimate word chain game with vocabulary learning features, achievements, and AI opponents.

## 🎮 Features

### Core Gameplay
- ⚔️ Play against AI with 3 difficulty levels (Easy, Medium, Hard)
- ⏱️ 20-second timer per turn
- 💚 3 attempts per game
- 🎯 Real-time word validation via Dictionary API
- 🌐 Vietnamese translations

### Learning & Vocabulary
- 📖 **Word Definitions**: Click any word in history to see:
  - Phonetic pronunciation (IPA)
  - Multiple meanings and parts of speech
  - Example sentences
  - Audio pronunciation
- ⭐ **Favorites System**: Mark words to review later
- 🔴 **Difficult Words**: Auto-marked when you make mistakes
- 📚 **Vocabulary Management**:
  - View all learned words
  - Filter by favorites or difficult words
  - Search functionality
  - Track usage statistics
  - Export to CSV

### Progression System
- 🎖️ **Level System**: Earn XP to level up
- 🏆 **11 Achievements** to unlock:
  - First Victory
  - Win Streaks (3, 5, 10)
  - Vocabulary Milestones (50, 100, 200 words)
  - Long Word (8+ letters)
  - Speed Demon (< 3 minutes)
  - Perfect Game (no mistakes)
  - Hard Mode Master

### Polish & UX
- 🔊 **Sound Effects**:
  - Click sounds
  - Success chimes
  - Error buzzes
  - Victory fanfare
  - Defeat sounds
  - Timer ticking (last 5 seconds)
  - Toggle on/off with persistent setting
- ✨ **Animations**:
  - Confetti on victory
  - Shake on errors
  - Fade in/out transitions
  - Smooth XP bar fills
  - Pulse effects
- 💡 **Hints System**: Get 3 word suggestions per game (costs 10 XP)
- 💾 **Auto-save**: All progress saved to localStorage

## 📁 Project Structure

```
Word Chain/
├── index.html              # New modular version (USE THIS)
├── index_advanced.html     # Old monolithic version (deprecated)
├── css/
│   └── animations.css      # All CSS animations
├── js/
│   ├── audio.js           # Sound effects management
│   ├── animations.js      # Animation functions
│   ├── vocabulary.js      # Word storage & management
│   ├── player.js          # Progress & achievements
│   ├── ui.js              # UI updates & modals
│   └── game.js            # Core game logic
└── README.md
```

## 🔧 Module Breakdown

### `audio.js` - AudioManager
- Web Audio API sound synthesis
- Toggle sound on/off
- 7 different sound effects
- Persistent settings

### `animations.js` - Animations
- Confetti celebrations
- Shake, fade, pulse effects
- Smooth transitions

### `vocabulary.js` - VocabularyManager
- Word storage with metadata
- Favorites & difficult word tracking
- Search & filter
- CSV export
- Dictionary API integration

### `player.js` - PlayerManager
- XP & leveling system
- Achievement tracking
- Progress persistence
- Statistics

### `ui.js` - UIManager
- Status messages
- Modal management
- Word definition display
- Vocabulary tab
- History display

### `game.js` - GameManager
- Core game loop
- Turn management
- Timer & attempts
- AI opponent logic
- Difficulty settings (now changeable anytime!)
- Hint system

## 🎯 Key Improvements

### 1. Fixed Difficulty Selection
- **Old**: Could only change difficulty before game start, required page reload
- **New**: Change difficulty anytime, even during game, auto-saved

### 2. Modular Architecture
- **Old**: 1200+ lines in single HTML file
- **New**: Clean separation of concerns across 6 modules
- Easier to debug and extend

### 3. Vocabulary Learning
- **New**: Complete vocabulary management system
- Click-to-define in history
- Favorites & difficult words
- Export functionality

### 4. Better UX
- All data persists across sessions
- Clickable word history
- Improved feedback
- Professional modals

## 🚀 Getting Started

Simply open `index.html` in a modern browser. No build process required!

All features work offline except:
- Word validation (Dictionary API)
- Translations (MyMemory API)
- AI word suggestions (Datamuse API)

## 💾 Data Storage

All data stored in browser's localStorage:
- `soundEnabled`: Sound preferences
- `gameDifficulty`: Selected difficulty
- `wordChainProgress`: Player level, XP, achievements
- `wordChainVocabulary`: All learned words, favorites, difficult words

## 🎨 Technologies

- **Frontend**: HTML5, Tailwind CSS, Vanilla JavaScript
- **Animations**: CSS3 animations + canvas-confetti library
- **Audio**: Web Audio API (synthesized sounds)
- **APIs**:
  - Dictionary API (definitions)
  - MyMemory Translation API
  - Datamuse API (word suggestions)

## 📝 Future Enhancements

Potential additions:
- Daily challenges
- Multiplayer mode
- Vocabulary flashcards
- Spaced repetition system
- Import/export progress
- Custom word lists
- Dark mode

## 🐛 Bug Fixes

- ✅ Difficulty can now be changed anytime (no reload needed)
- ✅ Modular code prevents global scope pollution
- ✅ Improved error handling
- ✅ Better mobile responsiveness

---

**Version**: 2.0 (Ultimate Edition)
**Last Updated**: 2025-01
**License**: MIT
