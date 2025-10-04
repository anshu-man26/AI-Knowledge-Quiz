const axios = require('axios');

class AIService {
  constructor() {

    this.apiKey = process.env.AI_API_KEY || 'mock-key';
    this.baseURL = process.env.AI_BASE_URL || 'https://api.openai.com/v1';
  }

  async generateQuizQuestions(topic, numberOfQuestions = 5) {
    try {
      return await this.generateWithGemini(topic, numberOfQuestions);
    } catch (error) {
      console.error('Error generating quiz questions:', error);
      throw new Error('Failed to generate quiz questions');
    }
  }

  async generateFeedback(topic, score, totalQuestions, results = null) {
    try {
      const percentage = Math.round((score / totalQuestions) * 100);
      
      console.log('=== FEEDBACK GENERATION START ===');
      console.log('API Key present:', this.apiKey ? 'Yes' : 'No');
      console.log('API Key starts with AIza:', this.apiKey?.startsWith('AIza'));
      console.log('Results present:', results ? 'Yes' : 'No');
      console.log('Results count:', results?.length || 0);
      
      if (results && results.length > 0) {
        console.log('Attempting Gemini AI feedback generation with detailed results...');
        try {
          const feedback = await this.generateFeedbackWithGemini(topic, score, totalQuestions, percentage, results);
          console.log('Gemini AI feedback generated successfully');
          return feedback;
        } catch (geminiError) {
          console.error('Gemini AI failed:', geminiError.message);
          console.log('Using detailed template fallback');
          return this.generateDetailedFeedback(topic, score, totalQuestions, percentage, results);
        }
      }
      
      if (this.apiKey && this.apiKey !== 'mock-key' && this.apiKey.startsWith('AIza')) {
        console.log('Attempting basic Gemini AI feedback...');
        try {
          const feedback = await this.generateFeedbackWithGemini(topic, score, totalQuestions, percentage, null);
          console.log('Basic Gemini feedback generated successfully');
          return feedback;
        } catch (geminiError) {
          console.error('Basic Gemini failed:', geminiError.message);
          console.log('Using generic fallback');
        }
      }
      
      console.log('Using generic feedback fallback');
      return this.generateGenericFeedback(topic, score, totalQuestions, percentage);
    } catch (error) {
      console.error('Error generating feedback:', error);
      throw new Error('Failed to generate feedback');
    }
  }

  generateDetailedFeedback(topic, score, totalQuestions, percentage, results) {
    const correctQuestions = results.filter(r => r.isCorrect);
    const incorrectQuestions = results.filter(r => !r.isCorrect);
    
    let feedback = '';
    
    if (percentage >= 80) {
      feedback += `🎉 Excellent work! You scored ${score}/${totalQuestions} (${percentage}%) on ${topic}.\n\n`;
    } else if (percentage >= 60) {
      feedback += `👍 Good job! You scored ${score}/${totalQuestions} (${percentage}%) on ${topic}.\n\n`;
    } else if (percentage >= 40) {
      feedback += `💪 You scored ${score}/${totalQuestions} (${percentage}%) on ${topic}. There's room for improvement!\n\n`;
    } else {
      feedback += `📚 You scored ${score}/${totalQuestions} (${percentage}%) on ${topic}. Keep learning and practicing!\n\n`;
    }
    
    if (correctQuestions.length > 0) {
      feedback += `✅ What you got right:\n`;
      correctQuestions.slice(0, 2).forEach((q, idx) => {
        feedback += `• ${q.question.substring(0, 60)}${q.question.length > 60 ? '...' : ''}\n`;
      });
      if (correctQuestions.length > 2) {
        feedback += `• And ${correctQuestions.length - 2} more correct answer${correctQuestions.length - 2 > 1 ? 's' : ''}!\n`;
      }
      feedback += '\n';
    }
    
  
    if (incorrectQuestions.length > 0) {
      feedback += `📖 Areas to review:\n`;
      incorrectQuestions.slice(0, 2).forEach((q, idx) => {
        const userAnswerText = q.userAnswer !== null && q.userAnswer !== undefined 
          ? q.options[q.userAnswer] 
          : 'No answer';
        const correctAnswerText = q.options[q.correctAnswer];
        feedback += `• ${q.question.substring(0, 50)}${q.question.length > 50 ? '...' : ''}\n`;
        feedback += `  You selected: "${userAnswerText}"\n`;
        feedback += `  Correct answer: "${correctAnswerText}"\n`;
      });
      if (incorrectQuestions.length > 2) {
        feedback += `• Review ${incorrectQuestions.length - 2} more question${incorrectQuestions.length - 2 > 1 ? 's' : ''} for better understanding.\n`;
      }
      feedback += '\n';
    }
    
    feedback += `💡 Next steps:\n`;
    if (percentage >= 80) {
      feedback += `• You've mastered this topic! Try a more advanced topic or retake to get 100%.\n`;
    } else if (percentage >= 60) {
      feedback += `• Review the missed questions and retake the quiz to solidify your knowledge.\n`;
    } else if (percentage >= 40) {
      feedback += `• Study the ${topic} material more thoroughly and focus on the concepts you missed.\n`;
      feedback += `• Take your time on each question and read all options carefully.\n`;
    } else {
      feedback += `• Start with the basics of ${topic} and build your foundation.\n`;
      feedback += `• Review each incorrect answer to understand why the correct answer is right.\n`;
      feedback += `• Don't get discouraged - mastery takes practice!\n`;
    }
    
    return feedback;
  }

  generateGenericFeedback(topic, score, totalQuestions, percentage) {
    if (percentage >= 80) {
      return `Outstanding performance! You scored ${score}/${totalQuestions} (${percentage}%) on ${topic}. Your knowledge in this area is impressive!`;
    } else if (percentage >= 60) {
      return `Great job! You scored ${score}/${totalQuestions} (${percentage}%) on ${topic}. You have a solid foundation in this topic.`;
    } else if (percentage >= 40) {
      return `Nice effort! You scored ${score}/${totalQuestions} (${percentage}%) on ${topic}. There's room for improvement - keep learning!`;
    } else {
      return `You scored ${score}/${totalQuestions} (${percentage}%) on ${topic}. Don't worry - every expert was once a beginner! Keep studying and practicing.`;
    }
  }

  async generateFeedbackWithGemini(topic, score, totalQuestions, percentage, results = null) {
    try {
      console.log('Building Gemini AI prompt...');
      
      let prompt = `You are an encouraging and insightful tutor. A student just completed a ${topic} quiz.\n\n`;
      prompt += `Performance Summary:\n`;
      prompt += `- Score: ${score} out of ${totalQuestions} (${percentage}%)\n`;
      prompt += `- Correct answers: ${score}\n`;
      prompt += `- Incorrect answers: ${totalQuestions - score}\n\n`;
      
      if (results && results.length > 0) {
        const correctQuestions = results.filter(r => r.isCorrect);
        const incorrectQuestions = results.filter(r => !r.isCorrect);
        
        console.log(`Including ${correctQuestions.length} correct and ${incorrectQuestions.length} incorrect questions in prompt`);
        
        if (correctQuestions.length > 0) {
          prompt += `Questions the student answered CORRECTLY:\n`;
          correctQuestions.forEach((q, idx) => {
            prompt += `${idx + 1}. "${q.question}"\n`;
            prompt += `   Correct answer: ${q.options[q.correctAnswer]}\n`;
          });
          prompt += '\n';
        }
        
        if (incorrectQuestions.length > 0) {
          prompt += `Questions the student answered INCORRECTLY:\n`;
          incorrectQuestions.forEach((q, idx) => {
            const userAnswerText = q.userAnswer !== null && q.userAnswer !== undefined 
              ? q.options[q.userAnswer] 
              : 'No answer provided';
            prompt += `${idx + 1}. Question: "${q.question}"\n`;
            prompt += `   Student selected: "${userAnswerText}"\n`;
            prompt += `   Correct answer: "${q.options[q.correctAnswer]}"\n`;
            prompt += `   All options were: ${q.options.map((opt, i) => `${i === q.correctAnswer ? '✓' : '•'} ${opt}`).join(', ')}\n`;
          });
          prompt += '\n';
        }
      }
      
      prompt += `Please provide personalized feedback that:\n`;
      prompt += `1. Starts with an encouraging opening about their ${percentage}% score\n`;
      prompt += `2. Highlights specific strengths (mention actual topics/questions they got right)\n`;
      prompt += `3. Points out specific areas for improvement (reference actual questions they got wrong)\n`;
      prompt += `4. Explains WHY the correct answers are right for the missed questions (brief explanations)\n`;
      prompt += `5. Provides 2-3 actionable study tips specific to ${topic}\n`;
      prompt += `6. Ends with motivation and encouragement\n\n`;
      prompt += `Format your response with clear sections using these emojis:\n`;
      prompt += `- 🎯 for overall performance\n`;
      prompt += `- ✅ for strengths\n`;
      prompt += `- 📚 for areas to improve (with brief explanations)\n`;
      prompt += `- 💡 for study tips\n`;
      prompt += `- 🚀 for closing motivation\n\n`;
      prompt += `Keep it conversational, specific, and around 200-300 words. Be a supportive tutor who really analyzes their performance!`;

      console.log('Sending request to Gemini API...');
      console.log('API URL:', this.baseURL);
      
      const response = await axios.post(`${this.baseURL}?key=${this.apiKey}`, {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 600,
        }
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Received response from Gemini API');
      
      if (response.data && response.data.candidates && response.data.candidates[0]) {
        const feedback = response.data.candidates[0].content.parts[0].text.trim();
        console.log('AI-generated feedback length:', feedback.length, 'characters');
        return feedback;
      }
      
      console.log('No candidates in Gemini response');
      throw new Error('No feedback generated');
      
    } catch (error) {
      console.error('Gemini feedback generation error:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', JSON.stringify(error.response.data, null, 2));
      }
      if (results) {
        console.log('Falling back to detailed template feedback');
        return this.generateDetailedFeedback(topic, score, totalQuestions, percentage, results);
      }
      console.log('Falling back to generic feedback');
      return this.generateGenericFeedback(topic, score, totalQuestions, percentage);
    }
  }

  async generateWithGemini(topic, numberOfQuestions) {
    try {
      const prompt = `Generate ${numberOfQuestions} multiple choice questions about ${topic}. 
      Each question should have exactly 4 options and indicate the correct answer index (0-3).
      Return ONLY a valid JSON object in this exact format:
      {
        "questions": [
          {
            "id": "1",
            "question": "Question text here?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correctAnswer": 0
          }
        ]
      }
      Make sure the questions are challenging but fair, and cover different aspects of ${topic}.`;

      const response = await axios.post(`${this.baseURL}?key=${this.apiKey}`, {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2000,
        }
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data && response.data.candidates && response.data.candidates[0]) {
        const generatedText = response.data.candidates[0].content.parts[0].text;
        
        const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const questionsData = JSON.parse(jsonMatch[0]);
          
          if (questionsData.questions && Array.isArray(questionsData.questions)) {
            return questionsData;
          }
        }
      }
      
      console.log('Gemini API response parsing failed');
      throw new Error('Failed to generate questions from AI response');
      
    } catch (error) {
      console.error('Gemini API error:', error.message);
      throw new Error('Failed to generate quiz questions');
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async retryApiCall(apiCall, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await apiCall();
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }
        console.log(`API call attempt ${attempt} failed, retrying...`);
        await this.delay(1000 * attempt); 
      }
    }
  }
}

module.exports = new AIService();
