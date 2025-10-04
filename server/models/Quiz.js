const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  options: [{
    type: String,
    required: true
  }],
  correctAnswer: {
    type: Number,
    required: true,
    min: 0,
    max: 3
  }
}, { _id: false });

const quizSchema = new mongoose.Schema({
  topic: {
    type: String,
    required: true
  },
  questions: [questionSchema],
  createdBy: {
    type: String,
    default: 'AI'
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Quiz', quizSchema);
