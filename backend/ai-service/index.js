// AI Service Module - Gemini Integration for Academic Tracker

export { genAI, model } from './config.js';
export { AcademicContextBuilder } from './contextBuilder.js';
export { AcademicChatService } from './chatService.js';

// Default export
import { AcademicChatService } from './chatService.js';
export default AcademicChatService;
