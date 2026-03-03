import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { sequelize } from './config/database.js';

// ✅ CRITICAL: Import models index to initialize all models and associations
import * as models from './models/index.js';

import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import teacherRoutes from './routes/teacherRoutes.js';
import parentRoutes from './routes/parentRoutes.js';
import subjectRoutes from './routes/subjectRoutes.js';
import classRoutes from './routes/classRoutes.js';
import lessonRoutes from './routes/lessonRoutes.js';
import examRoutes from './routes/examRoutes.js';
import assignmentRoutes from './routes/assignmentRoutes.js';
import resultRoutes from './routes/resultRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import ensureDbConnection from './middleware/dbConnection.js';
import { errorHandler } from './middleware/error.js';

// Load environment variables
dotenv.config();

if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === 'development') {
    process.env.JWT_SECRET = 'dev_jwt_secret_change_me';
    console.warn('⚠️ JWT_SECRET is missing. Using an insecure development fallback secret.');
    console.warn('⚠️ Add JWT_SECRET to backend/.env (see backend/.env.example) to keep tokens stable across restarts.');
  } else {
    console.error('❌ Missing JWT_SECRET in environment. Add it to backend/.env (see backend/.env.example).');
    process.exit(1);
  }
}

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware
app.use(helmet());




// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  skip: (req) => req.method === 'OPTIONS' || req.method === 'GET' // ignore preflight and safe reads
});
app.use('/api', limiter);

// CORS Configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests explicitly
app.options('*', cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging Middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// API Routes - ensure the DB connection is live before handling each request
app.use(ensureDbConnection);
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/parents', parentRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 404 Handler - Must be AFTER all API routes
app.use((req, res, next) => {
  const error = new Error(`The requested page or resource was not found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

// Import and use centralized error middleware
app.use(errorHandler);

// Database Connection and Server Start
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');

    // Sync ALL models with database (alter: false to avoid foreign key issues)
    await sequelize.sync({ alter: false, force: false });
    console.log('✅ Database models synchronized');
    
    // Log all created tables
    const [results] = await sequelize.query("SHOW TABLES");
    console.log(`📊 Total tables created: ${results.length}`);
    console.log('📋 Tables:', results.map(r => Object.values(r)[0]).join(', '));

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL}`);
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
};

startServer();

// periodic message to prevent idle disconnects and surface issues early
setInterval(async () => {
  try {
    await sequelize.authenticate();
    if (process.env.NODE_ENV === 'development') {
      console.log(' Database successful');
    }
  } catch (err) {
    console.error(' Database failed:', err.message);
  }
}, 30000); // ping every 30 seconds

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Promise Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
});

export default app;
