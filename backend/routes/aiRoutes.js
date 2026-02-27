import express from 'express';
import { AcademicChatService } from '../ai-service/index.js';
import { protect, authorize } from '../middleware/auth.js';
import * as models from '../models/index.js';

const router = express.Router();

// Initialize AI chat service with models
const chatService = new AcademicChatService(models);

/**
 * @route   POST /api/ai/chat
 * @desc    Send a message to the AI chatbot
 * @access  Private (Admin, Teacher, Student only)
 */
router.post('/chat', protect, authorize('admin', 'teacher', 'student'), async (req, res) => {
  try {
    const { message } = req.body;
    const user = req.user;

    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    const result = await chatService.generateResponse(message, user);

    if (result.success) {
      res.status(200).json({
        success: true,
        response: result.response,
        contextUsed: result.contextUsed
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.error || 'Failed to generate response'
      });
    }
  } catch (error) {
    console.error('AI Chat Route Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/ai/student-improvement/:studentId
 * @desc    Generate improvement plan for a specific student
 * @access  Private (Admin, Teacher only)
 */
router.post('/student-improvement/:studentId', protect, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const { studentId } = req.params;

    const result = await chatService.generateImprovementPlan(studentId);

    if (result.success) {
      res.status(200).json({
        success: true,
        improvementPlan: result.improvementPlan,
        studentData: result.studentData
      });
    } else {
      res.status(404).json({
        success: false,
        message: result.error || 'Failed to generate improvement plan'
      });
    }
  } catch (error) {
    console.error('Student Improvement Route Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/ai/class-analysis/:classId
 * @desc    Generate analysis for a specific class
 * @access  Private (Admin, Teacher only)
 */
router.post('/class-analysis/:classId', protect, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const { classId } = req.params;

    const result = await chatService.generateClassAnalysis(classId);

    if (result.success) {
      res.status(200).json({
        success: true,
        analysis: result.analysis,
        data: result.data
      });
    } else {
      res.status(404).json({
        success: false,
        message: result.error || 'Failed to generate class analysis'
      });
    }
  } catch (error) {
    console.error('Class Analysis Route Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/ai/clear-history
 * @desc    Clear conversation history for current user
 * @access  Private (Admin, Teacher only)
 */
router.delete('/clear-history', protect, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const userId = req.user.id;
    chatService.clearHistory(userId);

    res.status(200).json({
      success: true,
      message: 'Conversation history cleared'
    });
  } catch (error) {
    console.error('Clear History Route Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/ai/health
 * @desc    Check AI service health
 * @access  Public
 */
router.get('/health', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    res.status(200).json({
      success: true,
      message: 'AI service is operational',
      geminiConfigured: !!apiKey && apiKey.length > 10
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'AI service health check failed',
      error: error.message
    });
  }
});

export default router;
