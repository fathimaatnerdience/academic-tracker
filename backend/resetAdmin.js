import { sequelize } from './config/database.js';
import User from './models/User.js';

const resetAdminPassword = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    const admin = await User.findOne({ where: { email: 'admin@school.com' } });
    
    if (!admin) {
      console.log('❌ Admin user not found');
      process.exit(1);
    }

    // Update password - this will trigger the beforeUpdate hook to hash it
    admin.password = 'admin123';
    await admin.save();

    console.log('✅ Admin password reset successfully!');
    console.log('-----------------------------------');
    console.log('Email: admin@school.com');
    console.log('Password: admin123');
    console.log('-----------------------------------');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

resetAdminPassword();
