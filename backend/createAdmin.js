import { sequelize } from './config/database.js';
import User from './models/User.js';

const createAdminUser = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    const existingAdmin = await User.findOne({ where: { email: 'admin@school.com' } });
    
    if (existingAdmin) {
      console.log('ℹ️  Admin user already exists');
      console.log('Email: admin@school.com');
      console.log('Password: admin123');
      process.exit(0);
    }

    const admin = await User.create({
      username: 'admin',
      email: 'admin@school.com',
      password: 'admin123',
      role: 'admin',
      name: 'System Administrator',
      phone: '1234567890',
      isActive: true
    });

    console.log('✅ Admin user created successfully!');
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

createAdminUser();
