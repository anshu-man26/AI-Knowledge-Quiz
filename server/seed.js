const mongoose = require('mongoose');
const Topic = require('./models/Topic');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

const initialTopics = [
  {
    name: 'Wellness',
    description: 'Test your knowledge about health, fitness, nutrition, and mental well-being',
    icon: '🧘‍♀️',
    color: '#27ae60'
  },
  {
    name: 'Tech Trends',
    description: 'Stay updated with the latest technology trends, AI, and digital innovations',
    icon: '💻',
    color: '#3498db'
  },
  {
    name: 'Science',
    description: 'Explore fascinating facts about physics, chemistry, biology, and space',
    icon: '🔬',
    color: '#9b59b6'
  },
  {
    name: 'History',
    description: 'Journey through historical events, civilizations, and important figures',
    icon: '📜',
    color: '#e67e22'
  }
];

async function seedTopics() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');
    
    await Topic.deleteMany({});
    console.log('Cleared existing topics');
    
    const topics = await Topic.insertMany(initialTopics);
    console.log(`Inserted ${topics.length} topics:`);
    
    topics.forEach(topic => {
      console.log(`- ${topic.name}: ${topic.description}`);
    });
    
    console.log('Database seeding completed successfully!');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

seedTopics();
