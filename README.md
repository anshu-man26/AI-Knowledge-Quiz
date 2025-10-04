# 🎯 AI-Powered Quiz App

An intelligent quiz application that uses **Google Gemini AI** to generate personalized feedback based on student performance. The app analyzes each answer and provides detailed, educational feedback explaining why answers are correct or incorrect.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)
![Gemini AI](https://img.shields.io/badge/Gemini_AI-4285F4?style=flat&logo=google&logoColor=white)

---

## ✨ Features

- 🤖 **AI-Generated Feedback** - Gemini AI analyzes your answers and explains why they're right or wrong
- 📊 **Real-time Scoring** - Instant results with detailed breakdown
- 🎨 **Beautiful UI** - Modern, responsive design with smooth animations
- 🌙 **Dark/Light Mode** - Toggle between themes
- 📚 **Multiple Topics** - History, Science, Tech Trends, Wellness
- 🔄 **Dynamic Questions** - AI can generate new questions or use curated sets
- 💾 **Progress Tracking** - See detailed results for each question

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Topic Select │→ │  Quiz Game   │→ │   Results    │ │
│  │              │  │ (5 questions)│  │  + Feedback  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└──────────────────────────┬──────────────────────────────┘
                           │ REST API
┌──────────────────────────┴──────────────────────────────┐
│                  Backend (Node.js + Express)             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   MongoDB    │  │ Quiz Routes  │  │  AI Service  │ │
│  │   Database   │  │              │  │   (Gemini)   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└──────────────────────────┬──────────────────────────────┘
                           │
                           ▼
            ┌──────────────────────────┐
            │   Google Gemini AI API   │
            │  (Feedback Generation)   │
            └──────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- MongoDB (local or cloud)
- Gemini API Key ([Get one free](https://makersuite.google.com/app/apikey))

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd Plum
```

2. **Install dependencies**
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. **Configure environment variables**

Create `server/.env`:
```env
PORT=5001
MONGODB_URI=your_mongodb_connection_string
AI_API_KEY=your_gemini_api_key
AI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent
```

4. **Start the application**
```bash
# Terminal 1: Start backend
cd server
npm run dev

# Terminal 2: Start frontend
cd client
npm start
```

5. **Open your browser**
```
http://localhost:3000
```

---

## 📡 API Endpoints

### Quiz Routes

#### Generate Quiz
```http
POST /api/quiz/generate
Content-Type: application/json

{
  "topic": "History"
}

Response:
{
  "quizId": "507f1f77bcf86cd799439011",
  "topic": "History",
  "questions": [
    {
      "id": 1,
      "question": "In which year did World War II end?",
      "options": ["1944", "1945", "1946", "1947"]
    }
  ]
}
```

#### Submit Quiz
```http
POST /api/quiz/submit
Content-Type: application/json

{
  "quizId": "507f1f77bcf86cd799439011",
  "answers": [1, 2, 0, 3, 1]
}

Response:
{
  "score": 3,
  "totalQuestions": 5,
  "percentage": 60,
  "results": [
    {
      "question": "In which year did World War II end?",
      "options": ["1944", "1945", "1946", "1947"],
      "correctAnswer": 1,
      "userAnswer": 1,
      "isCorrect": true
    }
  ]
}
```

### AI Routes

#### Generate Feedback
```http
POST /api/ai/feedback
Content-Type: application/json

{
  "topic": "History",
  "score": 3,
  "totalQuestions": 5,
  "results": [
    {
      "question": "Which wonder was in Alexandria?",
      "options": ["Hanging Gardens", "Colossus", "Lighthouse", "Temple"],
      "correctAnswer": 2,
      "userAnswer": 0,
      "isCorrect": false
    }
  ]
}

Response:
{
  "feedback": "🎯 Great effort on your History quiz! Scoring 60% shows solid foundation...\n\n✅ Strengths:\nYou nailed the WWII timeline...\n\n📚 Areas to Improve:\nThe Lighthouse of Alexandria was built on Pharos Island around 280 BC..."
}
```

---

## 🤖 AI Prompt Example

The system sends detailed prompts to Gemini AI:

```
You are an encouraging tutor. A student completed a History quiz.

Performance Summary:
- Score: 3 out of 5 (60%)
- Correct answers: 3
- Incorrect answers: 2

Questions the student answered CORRECTLY:
1. "In which year did World War II end?"
   Correct answer: 1945

Questions the student answered INCORRECTLY:
1. Question: "Which wonder was in Alexandria?"
   Student selected: "Hanging Gardens"
   Correct answer: "Lighthouse of Alexandria"
   All options were: • Hanging Gardens, • Colossus, ✓ Lighthouse, • Temple

Please provide personalized feedback that:
1. Starts with encouraging opening about their 60% score
2. Highlights specific strengths
3. Points out areas for improvement
4. Explains WHY the correct answers are right
5. Provides 2-3 actionable study tips for History
6. Ends with motivation

Format with emojis: 🎯 ✅ 📚 💡 🚀
Keep it conversational and specific!
```

---

## 🎨 UI Features

### Interactive Quiz
- Single-selection multiple choice
- Click to select, click again to unselect
- Progress bar showing current question
- Real-time answer tracking

### Results Page
- Score visualization with animated progress bar
- Detailed question-by-question breakdown
- Expandable sections to review answers
- AI-generated personalized feedback
- Options to retake or try new topic

---

## 🔧 Configuration

### Gemini AI Settings
Located in `server/services/aiService.js`:

```javascript
generationConfig: {
  temperature: 0.8,      // Creativity level (0.0-1.0)
  maxOutputTokens: 600,  // Max response length
}
```

### Customization
- **Add topics**: Edit `server/services/aiService.js` → `getMockQuestions()`
- **Change question count**: Modify `numberOfQuestions` parameter (default: 5)
- **Adjust feedback length**: Change `maxOutputTokens` in config

---

## 📁 Project Structure

```
Plum/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── QuizGame.js
│   │   │   ├── Results.js
│   │   │   └── TopicSelection.js
│   │   ├── context/       # State management
│   │   ├── services/      # API calls
│   │   └── App.js
│   └── package.json
│
├── server/                # Node.js backend
│   ├── models/           # MongoDB schemas
│   │   ├── Quiz.js
│   │   └── Topic.js
│   ├── routes/           # API endpoints
│   │   ├── quiz.js
│   │   ├── ai.js
│   │   └── topics.js
│   ├── services/         # Business logic
│   │   └── aiService.js  # Gemini AI integration
│   ├── index.js          # Server entry point
│   └── package.json
│
└── README.md
```

---

## 🐛 Troubleshooting

### AI Feedback Not Working?

Run the debug script:
```bash
cd server
node debug-ai.js
```

Check server logs for:
```
✅ Gemini AI feedback generated successfully!
```

If you see:
```
❌ Gemini AI failed: [error]
```

**Common fixes:**
- Verify `AI_API_KEY` in `.env`
- Check internet connection
- Confirm API key is valid at [Google AI Studio](https://makersuite.google.com/)
- Restart server after `.env` changes

### Database Connection Issues
```bash
# Check MongoDB is running
mongosh

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URI in .env
```

---

## 🎯 How It Works

1. **Student selects topic** → Frontend requests quiz generation
2. **Backend generates questions** → Either from AI or curated database
3. **Student answers questions** → Selections stored in state
4. **Submit quiz** → Backend compares answers with correct ones
5. **Request feedback** → Send complete results to AI service
6. **AI analyzes** → Gemini receives all questions + answers
7. **Generate feedback** → AI creates personalized, educational response
8. **Display results** → Student sees score + AI feedback

---

## 📊 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Context API, Axios |
| Backend | Node.js, Express |
| Database | MongoDB, Mongoose |
| AI | Google Gemini 2.5 Flash |
| Styling | CSS3, Animations |

---

## 🚀 Future Enhancements

- [ ] User authentication and profiles
- [ ] Track quiz history and progress
- [ ] Difficulty levels (Easy, Medium, Hard)
- [ ] Timed quizzes with countdown
- [ ] Leaderboards and achievements
- [ ] Export results as PDF
- [ ] Mobile app (React Native)

---

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

---

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## 📞 Support

For issues or questions:
- Check existing documentation in `/docs` folder
- Review `TESTING_AI_FEEDBACK.md` for AI debugging
- Open an issue on GitHub

---

**Built with ❤️ using React, Node.js, and Google Gemini AI**
