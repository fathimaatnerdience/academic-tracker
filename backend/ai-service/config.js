import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Use gemini-2.5-flash model as specified by user
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

export { genAI, model };
