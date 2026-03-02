// Database connection middleware - ensures connection is alive before each request
import { sequelize } from '../config/database.js';

export const ensureDbConnection = async (req, res, next) => {
  try {
    // Check if connection is alive
    await sequelize.authenticate();
    next();
  } catch (error) {
    console.error('❌ Database connection lost. Attempting to reconnect...');
    try {
      // Try to reconnect
      await sequelize.authenticate();
      console.log('✅ Database reconnected successfully');
      next();
    } catch (reconnectError) {
      console.error('❌ Failed to reconnect to database:', reconnectError.message);
      res.status(503).json({
        success: false,
        message: 'Database connection unavailable. Please try again later.'
      });
    }
  }
};

export default ensureDbConnection;
