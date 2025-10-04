import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuiz } from '../context/QuizContext';


const QuizGame = () => {
  const { state, dispatch } = useQuiz();
  const navigate = useNavigate();
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  const currentQuestion = state.questions[state.currentQuestionIndex];
  const isLastQuestion = state.currentQuestionIndex === state.questions.length - 1;
  const progress = ((state.currentQuestionIndex + 1) / state.questions.length) * 100;

  useEffect(() => {
    if (!state.questions || state.questions.length === 0) {
      navigate('/');
      return;
    }

    setSelectedAnswer(state.answers[state.currentQuestionIndex] ?? null);
    setShowFeedback(false);
    setTimeLeft(30);
    setQuestionStartTime(Date.now());
  }, [state.currentQuestionIndex, state.questions, navigate]);

  useEffect(() => {
    // Timer for each question
    if (timeLeft > 0 && selectedAnswer === null) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, selectedAnswer]);

  const handleAnswerSelect = (answerIndex) => {
    // If clicking the same answer, unselect it
    if (selectedAnswer === answerIndex) {
      setSelectedAnswer(null);
      dispatch({ 
        type: 'ANSWER_QUESTION', 
        payload: null 
      });
      setShowFeedback(false);
    } else {
      // Select the new answer
      setSelectedAnswer(answerIndex);
      dispatch({ 
        type: 'ANSWER_QUESTION', 
        payload: answerIndex 
      });
      setShowFeedback(true);
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      // Calculate score and navigate to results
      const score = state.answers.reduce((total, answer, index) => {
        // Since we don't have correct answers in frontend for security,
        // we'll calculate score on the backend during results
        return total;
      }, 0);
      
      navigate('/results');
    } else {
      dispatch({ type: 'NEXT_QUESTION' });
    }
  };

  const handlePrevious = () => {
    if (state.currentQuestionIndex > 0) {
      dispatch({ type: 'PREV_QUESTION' });
    }
  };

  const handleFinishQuiz = () => {
    navigate('/results');
  };

  if (!currentQuestion) {
    return (
      <div className="quiz-game-container">
        <div className="loading">Loading question...</div>
      </div>
    );
  }

  return (
    <div className="quiz-game fade-in-up">
      {/* Header */}
      <div className="quiz-header">
        <div className="quiz-progress">
          Question {state.currentQuestionIndex + 1} of {state.questions.length}
        </div>
        <div className="quiz-topic">
          {state.selectedTopic}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-container">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Question */}
      <div className="question-card slide-in-right">
        <h2 className="question-text">
          {currentQuestion.question}
        </h2>
        
        {/* Answer Options */}
        <ul className="options-list">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            
            return (
              <li key={index} className="option-item">
                <button
                  className={`option-button ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleAnswerSelect(index)}
                >
                  {option}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Navigation */}
      <div className="quiz-controls">
        <button
          className="btn btn-secondary"
          onClick={handlePrevious}
          disabled={state.currentQuestionIndex === 0}
        >
          ← Previous
        </button>

        {selectedAnswer !== null && (
          <button
            className="btn"
            onClick={isLastQuestion ? handleFinishQuiz : handleNext}
          >
            {isLastQuestion ? 'Finish Quiz' : 'Next →'}
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizGame;