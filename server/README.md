# Word Chain Server

Backend API server for the Word Chain game application.

## Features

- User authentication with JWT
- Game session management (8 game modes)
- Vocabulary tracking with Spaced Repetition System
- Challenge system (daily, weekly, achievements)
- Comprehensive statistics and analytics
- Study modes (quiz, flashcards, spelling tests)

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens)
- **Security:** Helmet, CORS, bcryptjs

## Prerequisites

- Node.js 14+ and npm
- MongoDB 4.4+ (local or MongoDB Atlas)

## Installation

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
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

## Running the Server

### Development mode (with auto-reload):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

Server will start on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/password` - Change password
- `GET /api/auth/check-username/:username` - Check username availability

### Users
- `GET /api/users/profile` - Get user profile
- `GET /api/users/leaderboard` - Get leaderboard
- `GET /api/users/achievements` - Get achievements
- `POST /api/users/achievements/:id` - Unlock achievement

### Games
- `POST /api/games` - Create new game
- `GET /api/games` - Get game history
- `GET /api/games/:id` - Get game by ID
- `POST /api/games/:id/word` - Add word to game
- `PUT /api/games/:id/end` - End game
- `DELETE /api/games/:id` - Delete game

### Vocabulary
- `GET /api/vocabulary` - Get all words
- `POST /api/vocabulary` - Add/update word
- `GET /api/vocabulary/review/due` - Get words due for review
- `GET /api/vocabulary/:word` - Get specific word
- `PUT /api/vocabulary/:word/favorite` - Toggle favorite
- `PUT /api/vocabulary/:word/difficult` - Toggle difficult
- `POST /api/vocabulary/:word/review` - Record SRS review
- `DELETE /api/vocabulary/:word` - Delete word

### Challenges
- `GET /api/challenges` - Get active challenges
- `POST /api/challenges` - Create challenge
- `GET /api/challenges/completed` - Get completed challenges
- `GET /api/challenges/word-of-day` - Get word of the day
- `POST /api/challenges/daily` - Create daily challenge
- `POST /api/challenges/weekly` - Create weekly challenge
- `GET /api/challenges/:id` - Get challenge by ID
- `PUT /api/challenges/:id/progress` - Update progress

### Statistics
- `GET /api/statistics` - Get user statistics
- `GET /api/statistics/dashboard` - Get dashboard summary
- `GET /api/statistics/performance` - Get performance history
- `GET /api/statistics/letter-frequency` - Get letter frequency
- `GET /api/statistics/win-rate` - Get win rate by difficulty
- `GET /api/statistics/sessions` - Get session history
- `GET /api/statistics/calendar` - Get progress calendar

### Study
- `POST /api/study/quiz/generate` - Generate quiz
- `POST /api/study/quiz/submit` - Submit quiz results
- `GET /api/study/flashcards` - Get flashcards
- `POST /api/study/spelling/generate` - Generate spelling test
- `POST /api/study/spelling/submit` - Submit spelling test
- `POST /api/study/synonym-antonym/generate` - Generate synonym/antonym quiz
- `GET /api/study/plan` - Get personalized study plan

## Game Modes

1. **VS AI** - Classic mode against AI opponent
2. **Multiplayer Local** - 2 real players on same device
3. **Time Attack** - 60 seconds to use maximum words
4. **Survival** - Play until you can't think of a word
5. **Practice** - Unlimited time, no attempts limit
6. **Endless** - No win/lose conditions, just scoring
7. **Chain Challenge** - Words must increase in length (3→4→5→6...)
8. **Theme Mode** - Category-specific words only

## Database Models

- **User** - User accounts and profiles
- **Game** - Game sessions and results
- **Vocabulary** - User's learned words with SRS
- **Challenge** - Daily, weekly, and special challenges
- **Statistics** - Comprehensive user statistics

## Authentication

All protected routes require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

## Error Handling

All API responses follow this format:
```json
{
  "success": true/false,
  "message": "Description",
  "data": { ... }
}
```

## Security

- Passwords hashed with bcryptjs
- JWT tokens for stateless authentication
- Helmet for security headers
- CORS enabled for specified origin
- Input validation with express-validator

## Development

For local development:
1. Install MongoDB locally or use MongoDB Atlas
2. Run `npm run dev` for auto-reload
3. API will be available at `http://localhost:3000/api`

## Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Use MongoDB Atlas for database
3. Set strong `JWT_SECRET`
4. Configure `CLIENT_URL` to your frontend domain
5. Use process manager like PM2:
```bash
npm install -g pm2
pm2 start server.js --name wordchain-api
```

## License

MIT
