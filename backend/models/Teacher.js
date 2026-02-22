import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Teacher = sequelize.define('Teacher', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  teacherId: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: false
  },
  dateOfBirth: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other'),
    allowNull: false
  },
  qualification: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  experience: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Years of experience'
  },
  specialization: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  joiningDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  salary: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  bloodGroup: {
    type: DataTypes.STRING(5),
    allowNull: true
  },
  emergencyContact: {
    type: DataTypes.STRING(20),
    allowNull: true
  }
}, {
  tableName: 'teachers',
  timestamps: true
});

export default Teacher;
