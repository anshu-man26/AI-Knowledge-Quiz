import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QuizProvider } from './context/QuizContext';
import { ThemeProvider } from './context/ThemeContext';
import TopicSelection from './components/TopicSelection';
import QuizLoader from './components/QuizLoader';
import QuizGame from './components/QuizGame';
import Results from './components/Results';
import ThemeToggle from './components/ThemeToggle';

function App() {
  return (
    <ThemeProvider>
      <QuizProvider>
        <Router>
          <div className="quiz-app">
            <ThemeToggle />
            <div className="app-container">
              <header className="app-header">
                <h1>AI Knowledge Quiz</h1>
                <p>Test your knowledge with AI-generated questions</p>
              </header>
              <main className="app-content">
                <Routes>
                  <Route path="/" element={<TopicSelection />} />
                  <Route path="/loading" element={<QuizLoader />} />
                  <Route path="/quiz" element={<QuizGame />} />
                  <Route path="/results" element={<Results />} />
                </Routes>
              </main>
            </div>
          </div>
        </Router>
      </QuizProvider>
    </ThemeProvider>
  );
}

export default App;