import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuiz } from '../context/QuizContext';
import { apiService } from '../services/api';
import { motion } from 'framer-motion';
import { 
  FaHeart, 
  FaLaptopCode, 
  FaAtom, 
  FaBookOpen,
  FaBrain,
  FaRocket,
  FaPalette
} from 'react-icons/fa';


const TopicSelection = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { dispatch } = useQuiz();

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const topicsData = await apiService.getTopics();
      setTopics(topicsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching topics:', err);
      setError('Failed to load topics. Please try again.');
      // Fallback topics if API fails
      setTopics([
        { 
          name: 'Wellness', 
          description: 'Health, fitness, and mindful living', 
          icon: FaHeart, 
          gradient: 'linear-gradient(135deg, #8b5cf6 0%, #06d6a0 100%)',
          color: '#8b5cf6',
          lightColor: '#f8f9ff'
        },
        { 
          name: 'Technology', 
          description: 'Latest innovations and digital trends', 
          icon: FaLaptopCode, 
          gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          color: '#6366f1',
          lightColor: '#fff5f7'
        },
        { 
          name: 'Science', 
          description: 'Physics, chemistry, and discoveries', 
          icon: FaAtom, 
          gradient: 'linear-gradient(135deg, #06d6a0 0%, #34d399 100%)',
          color: '#06d6a0',
          lightColor: '#f0fcff'
        },
        { 
          name: 'History', 
          description: 'Ancient civilizations and epic stories', 
          icon: FaBookOpen, 
          gradient: 'linear-gradient(135deg, #f472b6 0%, #fbbf24 100%)',
          color: '#f472b6',
          lightColor: '#fff9f0'
        },
        { 
          name: 'Psychology', 
          description: 'Human behavior and mental processes', 
          icon: FaBrain, 
          gradient: 'linear-gradient(135deg, #a78bfa 0%, #f472b6 100%)',
          color: '#a78bfa',
          lightColor: '#f5fffe'
        },
        { 
          name: 'Space', 
          description: 'Cosmos, astronomy, and exploration', 
          icon: FaRocket, 
          gradient: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
          color: '#475569',
          lightColor: '#f8f9ff'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleTopicSelect = (topic) => {
    dispatch({ type: 'SET_TOPIC', payload: topic.name });
    dispatch({ type: 'RESET_QUIZ' });
    dispatch({ type: 'SET_TOPIC', payload: topic.name });
    navigate('/loading');
  };

  if (loading) {
    return (
      <div className="loading fade-in-up">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading topics...</p>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { 
      y: 60, 
      opacity: 0,
      scale: 0.9
    },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 300
      }
    }
  };

  const iconVariants = {
    initial: { scale: 1, rotate: 0 },
    hover: { 
      scale: 1.2, 
      rotate: 5,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };

  return (
    <div className="topic-selection">
      <div className="container">
        <motion.div 
          className="glass-card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <motion.h1 
            className="heading-xl text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Choose Your Adventure
          </motion.h1>
          <motion.p 
            className="text-center text-secondary"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Dive into fascinating subjects and challenge your mind
          </motion.p>
          
          {error && (
            <motion.div 
              className="error-message"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <span className="error-icon">⚠️</span>
              {error}
              <button onClick={fetchTopics} className="btn btn-secondary">
                Retry
              </button>
            </motion.div>
          )}
          
          <motion.div 
            className="topics-grid-modern"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {topics.map((topic, index) => {
              const IconComponent = topic.icon;
              return (
                <motion.div
                  key={topic.name || index}
                  className="modern-topic-card"
                  variants={cardVariants}
                  whileHover={{ 
                    y: -8,
                    scale: 1.02,
                    transition: { type: "spring", stiffness: 400 }
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleTopicSelect(topic)}
                  style={{
                    background: topic.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  }}
                >
                  <div className="card-overlay"></div>
                  <div className="card-content">
                    <motion.div 
                      className="modern-topic-icon"
                      variants={iconVariants}
                      initial="initial"
                      whileHover="hover"
                    >
                      {typeof IconComponent === 'function' ? <IconComponent /> : (topic.icon || '📚')}
                    </motion.div>
                    <motion.h3 
                      className="topic-title"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                    >
                      {topic.name}
                    </motion.h3>
                    <motion.p 
                      className="topic-description"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                    >
                      {topic.description}
                    </motion.p>
                  </div>
                  <div className="card-shine"></div>
                </motion.div>
              );
            })}
          </motion.div>

          <motion.div 
            className="topic-footer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <p>Each quiz features 5 AI-crafted questions</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default TopicSelection;