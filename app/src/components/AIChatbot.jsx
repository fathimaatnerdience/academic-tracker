import { useState, useRef, useEffect } from 'react';
import { X, Send, MessageSquare, Bot, User, Loader, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { aiAPI } from '../services/api';

const AIChatbot = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: 'Hello! I\'m your AI Academic Assistant .How can I assist you today?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const [isAiHealthy, setIsAiHealthy] = useState(true);
  const messagesEndRef = useRef(null);

  if (!user) {
    return null;
  }

  if (user?.role === 'parent') {
    return null;
  }

  // Check AI service health on mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const result = await aiAPI.healthCheck();
        setIsAiHealthy(result.geminiConfigured);
      } catch (err) {
        setIsAiHealthy(false);
      }
    };
    checkHealth();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    // Clear any previous error
    setError(null);

    // Add user message
    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: inputMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Call the AI API
      const response = await aiAPI.chat(inputMessage);
      
      if (response.success) {
        const botResponse = {
          id: Date.now() + 1,
          type: 'bot',
          text: response.response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botResponse]);
      } else {
        throw new Error(response.message || 'Failed to get AI response');
      }
    } catch (err) {
      console.error('AI Chat Error:', err);
      setError(err.message || 'Failed to get response from AI. Please try again.');
      
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: 'I apologize, but I\'m having trouble connecting to my knowledge base right now. Please try again in a moment.',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Role-specific quick questions
  const getQuickActions = () => {
    const role = user?.role;
    if (role === 'student') {
      return [
        'What is my average score?',
        'How is my attendance?',
        'Which subjects do I need to improve?',
        'What are my strong subjects?',
        "Show my subject breakdown"
      ];
    }
    // Admin and Teacher see class-wide questions
    return [
      'Who is the best performing student?',
      'Give me class performance analysis',
      "Which students need improvement?",
      'What is the class attendance rate?'
    ];
  };

  const quickActions = getQuickActions();

  const handleQuickAction = (action) => {
    setInputMessage(action);
  };

  const clearChat = async () => {
    try {
      await aiAPI.clearHistory();
      setMessages([
        {
          id: Date.now(),
          type: 'bot',
          text: 'Conversation history cleared. How can I help you today?',
          timestamp: new Date()
        }
      ]);
      setError(null);
    } catch (err) {
      console.error('Clear history error:', err);
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 sm:bottom-14 right-4 sm:right-6 z-50 text-white p-3 sm:p-4 rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 group"
          style={{ backgroundColor: '#DDDB59' }}
        >
          <MessageSquare size={24} className="animate-pulse" />
          <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-pink-600 text-white text-[10px] sm:text-xs rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center font-bold animate-bounce">
            AI
          </span>
          {!isAiHealthy && (
            <span className="absolute -bottom-1 -left-1 bg-red-500 rounded-full w-3 h-3 animate-ping" />
          )}
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Ask AI Assistant
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-4 sm:bottom-14 right-2 sm:right-4 z-50 w-[95%] sm:w-[400px] h-[500px] sm:h-[600px] max-h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col animate-slideUp">
          
          {/* Header */}
          <div className="text-white p-4 rounded-t-2xl flex items-center justify-between" style={{ backgroundColor: '#DDDB59' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/30 rounded-full flex items-center justify-center backdrop-blur">
                <Bot size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg">AI Assistant</h3>
                <p className="text-xs text-white/90 flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${isAiHealthy ? 'bg-green-400' : 'bg-red-400'}`} />
                  {isAiHealthy ? 'Online' : 'Service unavailable'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={clearChat}
                className="p-2 hover:bg-white/20 rounded-lg transition text-xs"
                title="Clear chat history"
              >
                Clear
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-3 flex items-center gap-2">
              <AlertCircle size={16} className="text-red-400" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.type === 'bot' 
                    ? 'text-white' 
                    : 'bg-gray-300 text-gray-700'
                }`} style={message.type === 'bot' ? { backgroundColor: message.isError ? '#EF4444' : '#DDDB59' } : {}}>
                  {message.type === 'bot' ? <Bot size={18} /> : <User size={18} />}
                </div>

                {/* Message Bubble */}
                <div className={`max-w-[70%] ${message.type === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`px-4 py-3 rounded-2xl ${
                    message.type === 'bot'
                      ? message.isError 
                        ? 'bg-red-50 border border-red-200 text-red-800'
                        : 'bg-white shadow-md text-gray-800'
                      : 'text-white'
                  }`} style={message.type === 'user' ? { backgroundColor: '#DDDB59' } : {}}>
                    <p className="text-sm whitespace-pre-line">{message.text}</p>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 px-2">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full text-white flex items-center justify-center" style={{ backgroundColor: '#DDDB59' }}>
                  <Bot size={18} />
                </div>
                <div className="bg-white shadow-md px-4 py-3 rounded-2xl">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length <= 2 && !isTyping && (
            <div className="p-4 bg-white border-t">
              <p className="text-xs text-gray-500 mb-2 font-semibold">Quick Questions:</p>
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickAction(action)}
                    className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition text-left"
                    disabled={isTyping}
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t rounded-b-2xl">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about students, classes, performance..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-200"
                disabled={isTyping || !isAiHealthy}
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isTyping || !isAiHealthy}
                className="px-4 py-3 text-white rounded-xl hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition"
                style={{ backgroundColor: '#DDDB59' }}
              >
                {isTyping ? <Loader size={20} className="animate-spin" /> : <Send size={20} />}
              </button>
            </div>
          </form>

        </div>
      )}

      {/* CSS for Animation */}
      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default AIChatbot;
