const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');

router.post('/feedback', async (req, res) => {
  try {
    const { topic, score, totalQuestions, results } = req.body;
    
    if (!topic || score === undefined || !totalQuestions) {
      return res.status(400).json({ 
        error: 'Topic, score, and totalQuestions are required' 
      });
    }
    
    if (score < 0 || score > totalQuestions) {
      return res.status(400).json({ 
        error: 'Score must be between 0 and totalQuestions' 
      });
    }
    
    console.log(`Generating feedback for topic: ${topic}, score: ${score}/${totalQuestions}`);
    
    const feedback = await aiService.generateFeedback(topic, score, totalQuestions, results);
    
    res.json({
      feedback,
      topic,
      score,
      totalQuestions,
      percentage: Math.round((score / totalQuestions) * 100)
    });
    
  } catch (error) {
    console.error('Error generating feedback:', error);
    res.status(500).json({ 
      error: 'Failed to generate feedback',
      message: error.message 
    });
  }
});

router.get('/health', (req, res) => {
  res.json({
    status: 'AI service is running',
    timestamp: new Date().toISOString(),
    features: [
      'Quiz question generation',
      'Personalized feedback',
      'Multiple topic support'
    ]
  });
});

module.exports = router;
