import { useState, useRef, useEffect } from 'react';
import { X, Send, MessageSquare, Bot, User, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const AIChatbot = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: 'Hello! I\'m your Academic Assistant. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Only show for admin and teacher
  if (!user || (user.role !== 'admin' && user.role !== 'teacher')) {
    return null;
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: inputMessage,
      timestamp: new Date()
    };
    setMessages([...messages, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response (Replace this with actual API call later)
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        type: 'bot',
        text: getBotResponse(inputMessage),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  // Mock AI responses - Replace with actual AI API
  const getBotResponse = (userInput) => {
    const input = userInput.toLowerCase();
    
    if (input.includes('student') && input.includes('total')) {
      return 'According to the latest data, there are 1,234 students enrolled across all grades.';
    } else if (input.includes('attendance')) {
      return 'The current attendance rate is 94.5%, which is above our target of 90%. Would you like to see details for a specific class?';
    } else if (input.includes('teacher')) {
      return 'We currently have 89 teachers on staff. You can manage teacher information in the Teachers section.';
    } else if (input.includes('exam') || input.includes('test')) {
      return 'You can schedule exams in the Exams section. Would you like me to guide you through creating a new exam?';
    } else if (input.includes('class')) {
      return 'We have 42 classes across different grades. You can view and manage them in the Classes section.';
    } else if (input.includes('help')) {
      return 'I can help you with:\n• Student information and statistics\n• Attendance tracking\n• Exam scheduling\n• Class management\n• Teacher information\n• Performance reports\n\nWhat would you like to know?';
    } else {
      return 'I understand you\'re asking about: "' + userInput + '". Could you please provide more details? You can also ask me about students, teachers, classes, exams, or attendance.';
    }
  };

  const quickActions = [
    'How many students do we have?',
    'What\'s the attendance rate?',
    'Show me exam schedule',
    'Help'
  ];

  const handleQuickAction = (action) => {
    setInputMessage(action);
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
          <MessageSquare size={24} sm:size-28 className="animate-pulse" />
          <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-pink-600 text-white text-[10px] sm:text-xs rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center font-bold animate-bounce">
            AI
          </span>
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Ask AI Assistant
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-4 sm:bottom-14 right-2 sm:right-4 z-50 w-[60%] sm:w-[90%] md:w-[400px] h-[80%] sm:h-[600px] max-h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col animate-slideUp">
          
          {/* Header */}
          <div className="text-white p-4 rounded-t-2xl flex items-center justify-between" style={{ backgroundColor: '#DDDB59' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/30 rounded-full flex items-center justify-center backdrop-blur">
                <Bot size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg">AI Assistant</h3>
                <p className="text-xs text-white/90">Always here to help</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/20 rounded-lg transition"
            >
              <X size={20} />
            </button>
          </div>

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
                }`} style={message.type === 'bot' ? { backgroundColor: '#DDDB59' } : {}}>
                  {message.type === 'bot' ? <Bot size={18} /> : <User size={18} />}
                </div>

                {/* Message Bubble */}
                <div className={`max-w-[70%] ${message.type === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`px-4 py-3 rounded-2xl ${
                    message.type === 'bot'
                      ? 'bg-white shadow-md text-gray-800'
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
          {messages.length <= 1 && (
            <div className="p-4 bg-white border-t">
              <p className="text-xs text-gray-500 mb-2 font-semibold">Quick Questions:</p>
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickAction(action)}
                    className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition"
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
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-200"
                disabled={isTyping}
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isTyping}
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
