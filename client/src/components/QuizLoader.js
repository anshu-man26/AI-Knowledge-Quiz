import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuiz } from '../context/QuizContext';
import { apiService } from '../services/api';


const QuizLoader = () => {
  const { state, dispatch } = useQuiz();
  const navigate = useNavigate();
  const [loadingText, setLoadingText] = useState('Initializing AI...');
  const [progress, setProgress] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const loadingSteps = [
    'Initializing AI...',
    'Analyzing topic knowledge...',
    'Generating questions...',
    'Crafting answer options...',
    'Finalizing your quiz...'
  ];

  useEffect(() => {
    if (!state.selectedTopic) {
      navigate('/');
      return;
    }

    generateQuiz();
  }, [state.selectedTopic, retryCount]);

  useEffect(() => {
    // Animate loading text and progress
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = Math.min(prev + Math.random() * 15, 90);
        
        // Update loading text based on progress
        const stepIndex = Math.floor((newProgress / 90) * loadingSteps.length);
        setLoadingText(loadingSteps[Math.min(stepIndex, loadingSteps.length - 1)]);
        
        return newProgress;
      });
    }, 300);

    return () => clearInterval(interval);
  }, []);

  const generateQuiz = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const quizData = await apiService.generateQuiz(state.selectedTopic);
      
      // Complete the progress bar
      setProgress(100);
      setLoadingText('Quiz ready!');
      
      dispatch({ type: 'SET_QUESTIONS', payload: quizData });
      
      // Small delay to show completion
      setTimeout(() => {
        navigate('/quiz');
      }, 500);

    } catch (error) {
      console.error('Error generating quiz:', error);
      
      if (retryCount < maxRetries) {
        setLoadingText(`Retrying... (${retryCount + 1}/${maxRetries})`);
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          setProgress(0);
        }, 2000);
      } else {
        dispatch({ 
          type: 'SET_ERROR', 
          payload: 'Failed to generate quiz after multiple attempts. Please try again.' 
        });
      }
    }
  };

  const handleRetry = () => {
    setRetryCount(0);
    setProgress(0);
    setLoadingText('Initializing AI...');
    generateQuiz();
  };

  const handleGoBack = () => {
    navigate('/');
  };

  if (state.error) {
    return (
      <div className="quiz-loader-container">
        <div className="error-container">
          <div className="error-icon">❌</div>
          <h2>Oops! Something went wrong</h2>
          <p className="error-message">{state.error}</p>
          <div className="error-actions">
            <button onClick={handleRetry} className="retry-btn">
              Try Again
            </button>
            <button onClick={handleGoBack} className="back-btn">
              Choose Different Topic
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="loading fade-in-up">
      <div className="loading-spinner"></div>
      <p className="loading-text">{loadingText}</p>
      <div className="selected-topic">
        Preparing {state.selectedTopic} quiz...
      </div>
    </div>
  );
};

export default QuizLoader;