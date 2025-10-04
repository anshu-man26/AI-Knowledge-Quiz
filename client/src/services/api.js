import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

export const apiService = {
  // Get available topics
  getTopics: async () => {
    const response = await api.get('/topics');
    return response.data;
  },

  // Generate quiz questions for a topic
  generateQuiz: async (topic) => {
    const response = await api.post('/quiz/generate', { topic });
    return response.data;
  },

  // Submit quiz answers and get score with correct answers
  submitQuiz: async (quizId, answers) => {
    const response = await api.post('/quiz/submit', {
      quizId,
      answers,
    });
    return response.data;
  },

  // Get AI feedback based on score and topic
  getFeedback: async (topic, score, totalQuestions, results = null) => {
    const response = await api.post('/ai/feedback', {
      topic,
      score,
      totalQuestions,
      results, // Send detailed results for better feedback
    });
    return response.data.feedback;
  },
};