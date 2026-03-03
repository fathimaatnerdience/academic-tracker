import express from 'express';
import { AcademicChatService } from '../ai-service/index.js';
import { protect, authorize } from '../middleware/auth.js';
import * as models from '../models/index.js';

const router = express.Router();

const chatService = new AcademicChatService(models);

router.post('/chat', protect, authorize('admin', 'teacher', 'student'), async (req, res, next) => {
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
    next(error);
  }
});

router.post('/student-improvement/:studentId', protect, authorize('admin', 'teacher'), async (req, res, next) => {
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
    next(error);
  }
});

router.post('/class-analysis/:classId', protect, authorize('admin', 'teacher'), async (req, res, next) => {
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
    next(error);
  }
});

router.delete('/clear-history', protect, authorize('admin', 'teacher'), async (req, res, next) => {
  try {
    const userId = req.user.id;
    chatService.clearHistory(userId);

    res.status(200).json({
      success: true,
      message: 'Conversation history cleared'
    });
  } catch (error) {
    console.error('Clear History Route Error:', error);
    next(error);
  }
});

router.get('/health', async (req, res, next) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    res.status(200).json({
      success: true,
      message: 'AI service is operational',
      geminiConfigured: !!apiKey && apiKey.length > 10
    });
  } catch (error) {
    next(error);
  }
});

export default router;
