import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuiz } from '../context/QuizContext';
import { apiService } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown, FaChevronUp, FaCheck, FaTimes, FaClock, FaInfoCircle } from 'react-icons/fa';


const Results = () => {
  const { state, dispatch } = useQuiz();
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState('');
  const [loadingFeedback, setLoadingFeedback] = useState(true);
  const [score, setScore] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const hasCalculated = useRef(false); // Prevent multiple calculations
  const isCalculating = useRef(false); // Prevent concurrent calculations

  // Function to clean feedback text
  const cleanFeedbackText = (feedbackText) => {
    return feedbackText
      .replace(/\[student name\]/gi, '')
      .replace(/Hey,?\s*/gi, '')
      .replace(/^\s*,?\s*/, '') // Remove leading comma and spaces
      .trim();
  };

  useEffect(() => {
    if (!state.questions || state.questions.length === 0) {
      navigate('/');
      return;
    }

    // If we already have feedback set (either from state or previous calculation), don't do anything
    if (feedback && !loadingFeedback) {
      return;
    }

    // Check if we already calculated or are currently calculating
    if (hasCalculated.current || isCalculating.current) {
      return;
    }

    // If we already have score and feedback in context state, use them
    if (state.score !== undefined && state.feedback) {
      const cleanedFeedback = cleanFeedbackText(state.feedback);
      setScore(state.score);
      setFeedback(cleanedFeedback);
      setLoadingFeedback(false);
      hasCalculated.current = true;
      return;
    }

    // If no existing data and haven't calculated yet, calculate once
    hasCalculated.current = true;
    calculateScoreAndGetFeedback();
  }, []); // Keep empty dependency array to run only once

  // Additional useEffect to ensure feedback stays stable once set
  useEffect(() => {
    if (feedback && state.feedback && feedback !== cleanFeedbackText(state.feedback)) {
      // If our local feedback is different from context feedback, keep the local one
      // This prevents flickering when context updates
      console.log('Preventing feedback change from:', cleanFeedbackText(state.feedback), 'to:', feedback);
    }
  }, [state.feedback]);

  const calculateScoreAndGetFeedback = async () => {
    if (isCalculating.current) {
      return; // Prevent concurrent calculations
    }
    
    isCalculating.current = true;
    
    try {
      if (!state.quizId) {
        throw new Error('Quiz ID not found');
      }

      // Submit quiz and get score with correct answers
      const submissionResult = await apiService.submitQuiz(state.quizId, state.answers);
      
      setScore(submissionResult.score);
      dispatch({ type: 'SET_SCORE', payload: submissionResult.score });

      // Store the results with correct answers for display
      const questionsWithCorrectAnswers = state.questions.map((question, index) => {
        const result = submissionResult.results[index];
        return {
          ...question,
          correctAnswer: result.correctAnswer
        };
      });

      // Update questions in state with correct answers
      dispatch({ 
        type: 'SET_QUESTIONS', 
        payload: { 
          questions: questionsWithCorrectAnswers, 
          quizId: state.quizId 
        } 
      });

      // Get AI feedback
      const feedbackResponse = await apiService.getFeedback(
        state.selectedTopic,
        submissionResult.score,
        state.questions.length,
        submissionResult.results // Pass the detailed results for better feedback
      );

      const cleanedFeedback = cleanFeedbackText(feedbackResponse);
      
      // Set local state first for immediate UI update
      setFeedback(cleanedFeedback);
      setLoadingFeedback(false);
      
      // Then update global state without causing re-render issues
      dispatch({ type: 'SET_FEEDBACK', payload: cleanedFeedback });
    } catch (error) {
      console.error('Error getting feedback:', error);
      // Fallback: try to calculate score locally if available
      let fallbackScore = 0;
      state.questions.forEach((question, index) => {
        const userAnswer = state.answers[index];
        if (userAnswer !== undefined && question.correctAnswer !== undefined) {
          if (userAnswer === question.correctAnswer) {
            fallbackScore++;
          }
        }
      });
      
      setScore(fallbackScore);
      const percentage = Math.round((fallbackScore / state.questions.length) * 100);
      const fallbackFeedback = `You completed the ${state.selectedTopic} quiz with ${fallbackScore}/${state.questions.length} correct answers (${percentage}%). Great effort!`;
      const cleanedFallback = cleanFeedbackText(fallbackFeedback);
      
      setFeedback(cleanedFallback);
      dispatch({ type: 'SET_FEEDBACK', payload: cleanedFallback });
    } finally {
      setLoadingFeedback(false);
      isCalculating.current = false;
    }
  };

  const getScoreEmoji = () => {
    const percentage = (score / state.questions.length) * 100;
    if (percentage >= 80) return '🏆';
    if (percentage >= 60) return '👏';
    if (percentage >= 40) return '👍';
    return '💪';
  };

  const getScoreColor = () => {
    const percentage = (score / state.questions.length) * 100;
    if (percentage >= 80) return '#27ae60';
    if (percentage >= 60) return '#f39c12';
    if (percentage >= 40) return '#e67e22';
    return '#e74c3c';
  };

  const getPerformanceText = () => {
    const percentage = (score / state.questions.length) * 100;
    if (percentage >= 80) return 'Excellent!';
    if (percentage >= 60) return 'Good Job!';
    if (percentage >= 40) return 'Not Bad!';
    return 'Keep Learning!';
  };

  const handleRetakeQuiz = () => {
    dispatch({ type: 'RESET_QUIZ' });
    dispatch({ type: 'SET_TOPIC', payload: state.selectedTopic });
    navigate('/loading');
  };

  const handleTryNewTopic = () => {
    dispatch({ type: 'RESET_QUIZ' });
    navigate('/');
  };

  const percentage = Math.round((score / state.questions.length) * 100);

  return (
    <div className="results fade-in-up">
      {/* Score Display */}
      <div className="score-display">
        <div className="score-emoji">{getScoreEmoji()}</div>
        <div className="score-number">{percentage}%</div>
        <div className="score-text">{score} out of {state.questions.length} correct</div>
        <div className="performance-message">{getPerformanceText()}</div>
      </div>

      {/* AI Feedback */}
      <div className="feedback-section">
        <h3>Personalized Feedback</h3>
        {loadingFeedback ? (
            <div className="feedback-loading">
              <div className="loading-spinner"></div>
              <p>Analyzing your performance...</p>
            </div>
          ) : (
            <div className="feedback-content">
              <div className="feedback-icon">📊</div>
              <div className="feedback-text">
                {feedback.split('\n').map((line, index) => (
                  <React.Fragment key={index}>
                    {line}
                    {index < feedback.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="progress-visualization">
          <div className="animated-progress-bar">
            <div 
              className="progress-fill" 
              style={{ 
                '--fill-width': `${percentage}%`,
                '--fill-color': getScoreColor()
              }}
            ></div>
          </div>
        </div>

        {/* Modern Question Details Toggle */}
        <motion.div 
          className="modern-details-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <motion.button 
            className="modern-toggle-btn"
            onClick={() => setShowDetails(!showDetails)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="toggle-content">
              <FaInfoCircle className="toggle-icon" />
              <span className="toggle-text">
                {showDetails ? 'Hide' : 'Show'} Question Details
              </span>
              <motion.div
                className="chevron-icon"
                animate={{ rotate: showDetails ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <FaChevronDown />
              </motion.div>
            </div>
          </motion.button>

          <AnimatePresence>
            {showDetails && (
              <motion.div 
                className="modern-question-details"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <div className="details-header">
                  <h4>Quiz Summary</h4>
                  <div className="summary-stats">
                    <span className="stat-item">
                      <FaCheck className="stat-icon correct" />
                      {state.score} Correct
                    </span>
                    <span className="stat-item">
                      <FaTimes className="stat-icon incorrect" />
                      {state.questions.length - state.score} Incorrect
                    </span>
                  </div>
                </div>
                <div className="questions-summary">
                  {state.questions.map((question, index) => {
                    const userAnswer = state.answers[index];
                    const wasAnswered = userAnswer !== undefined;
                    const isCorrect = wasAnswered && userAnswer === question.correctAnswer;
                    
                    return (
                      <motion.div 
                        key={index} 
                        className="modern-question-summary"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="question-header">
                          <span className="question-number">Q{index + 1}</span>
                          <div className="status-indicators">
                            {wasAnswered ? (
                              <span className={`answer-status ${isCorrect ? 'correct' : 'incorrect'}`}>
                                {isCorrect ? <FaCheck /> : <FaTimes />}
                                {isCorrect ? 'Correct' : 'Incorrect'}
                              </span>
                            ) : (
                              <span className="answer-status skipped">
                                <FaClock />
                                Skipped
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="question-content">
                          <div className="question-text">
                            {question.question}
                          </div>
                          {wasAnswered && (
                            <div className="answer-details">
                              <div className="user-answer">
                                <strong>Your answer:</strong> {question.options[userAnswer]}
                              </div>
                              {!isCorrect && question.correctAnswer !== undefined && (
                                <div className="correct-answer">
                                  <strong>Correct answer:</strong> {question.options[question.correctAnswer]}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

      {/* Action Buttons */}
      <div className="results-actions">
        <button 
          className="btn btn-secondary"
          onClick={handleRetakeQuiz}
        >
          Retake Quiz
        </button>
        <button 
          className="btn"
          onClick={handleTryNewTopic}
        >
          Try New Topic
        </button>
      </div>
    </div>
  );
};

export default Results;