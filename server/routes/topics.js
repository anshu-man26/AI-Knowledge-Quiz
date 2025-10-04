const express = require('express');
const router = express.Router();
const Topic = require('../models/Topic');


router.get('/', async (req, res) => {
  try {
    const topics = await Topic.find({ isActive: true }).sort({ name: 1 });
    res.json(topics);
  } catch (error) {
    console.error('Error fetching topics:', error);
    res.status(500).json({ error: 'Failed to fetch topics' });
  }
});


router.get('/:name', async (req, res) => {
  try {
    const topic = await Topic.findOne({ 
      name: req.params.name, 
      isActive: true 
    });
    
    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }
    
    res.json(topic);
  } catch (error) {
    console.error('Error fetching topic:', error);
    res.status(500).json({ error: 'Failed to fetch topic' });
  }
});


router.post('/', async (req, res) => {
  try {
    const { name, description, icon, color } = req.body;
    
    if (!name || !description) {
      return res.status(400).json({ error: 'Name and description are required' });
    }
    
    const topic = new Topic({
      name,
      description,
      icon: icon || '📚',
      color: color || '#3498db'
    });
    
    await topic.save();
    res.status(201).json(topic);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Topic already exists' });
    }
    console.error('Error creating topic:', error);
    res.status(500).json({ error: 'Failed to create topic' });
  }
});

module.exports = router;
