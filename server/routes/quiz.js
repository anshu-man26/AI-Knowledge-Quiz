const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const aiService = require('../services/aiService');

router.post('/generate', async (req, res) => {
  try {
    const { topic } = req.body;
    
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }
    
    console.log(`Generating quiz for topic: ${topic}`);
    
    const quizData = await aiService.generateQuizQuestions(topic, 5);
    
    const cleanedQuestions = quizData.questions.map(q => ({
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer
    }));
    
    const quiz = new Quiz({
      topic,
      questions: cleanedQuestions
    });
    
    await quiz.save();
    
    const questionsForClient = cleanedQuestions.map((q, index) => ({
      id: index + 1, 
      question: q.question,
      options: q.options
    }));
    
    res.json({
      quizId: quiz._id,
      topic,
      questions: questionsForClient
    });
    
  } catch (error) {
    console.error('Error generating quiz:', error);
    res.status(500).json({ 
      error: 'Failed to generate quiz',
      message: error.message 
    });
  }
});

router.post('/submit', async (req, res) => {
  try {
    const { quizId, answers } = req.body;
    
    if (!quizId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'Quiz ID and answers array are required' });
    }
    
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    
    let score = 0;
    const results = [];
    
    for (let i = 0; i < quiz.questions.length; i++) {
      const question = quiz.questions[i];
      const userAnswer = answers[i];
      const isCorrect = userAnswer === question.correctAnswer;
      
      if (isCorrect) {
        score++;
      }
      
      results.push({
        questionIndex: i,
        question: question.question,
        options: question.options,
        correctAnswer: question.correctAnswer,
        userAnswer,
        isCorrect
      });
    }
    
    res.json({
      score,
      totalQuestions: quiz.questions.length,
      percentage: Math.round((score / quiz.questions.length) * 100),
      results,
      topic: quiz.topic
    });
    
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({ 
      error: 'Failed to submit quiz',
      message: error.message 
    });
  }
});

router.get('/:quizId', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    
    const questionsForClient = quiz.questions.map((q, index) => ({
      id: q.id || `${quiz._id}_${index}`,
      question: q.question,
      options: q.options
    }));
    
    res.json({
      quizId: quiz._id,
      topic: quiz.topic,
      questions: questionsForClient,
      createdAt: quiz.createdAt
    });
    
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({ 
      error: 'Failed to fetch quiz',
      message: error.message 
    });
  }
});

module.exports = router;
