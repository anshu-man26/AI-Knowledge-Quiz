import React, { createContext, useContext, useReducer } from 'react';

const initialState = {
  selectedTopic: '',
  questions: [],
  quizId: null,
  currentQuestionIndex: 0,
  answers: [],
  score: 0,
  feedback: '',
  loading: false,
  error: null,
};

const QuizContext = createContext();

function quizReducer(state, action) {
  switch (action.type) {
    case 'SET_TOPIC':
      return { ...state, selectedTopic: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_QUESTIONS':
      return { 
        ...state, 
        questions: action.payload.questions, 
        quizId: action.payload.quizId,
        loading: false 
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'ANSWER_QUESTION':
      const newAnswers = [...state.answers];
      newAnswers[state.currentQuestionIndex] = action.payload;
      return { ...state, answers: newAnswers };
    case 'NEXT_QUESTION':
      return { ...state, currentQuestionIndex: state.currentQuestionIndex + 1 };
    case 'PREV_QUESTION':
      return { ...state, currentQuestionIndex: state.currentQuestionIndex - 1 };
    case 'SET_SCORE':
      return { ...state, score: action.payload };
    case 'SET_FEEDBACK':
      return { ...state, feedback: action.payload };
    case 'RESET_QUIZ':
      return initialState;
    default:
      return state;
  }
}

export function QuizProvider({ children }) {
  const [state, dispatch] = useReducer(quizReducer, initialState);
  
  return (
    <QuizContext.Provider value={{ state, dispatch }}>
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
}