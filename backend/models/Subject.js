import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Subject = sequelize.define('Subject', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  subjectName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'subjectName'
  },
  code: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  gradeLevel: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 12
    }
  },
  type: {
    type: DataTypes.ENUM('core', 'elective', 'extra'),
    allowNull: false,
    defaultValue: 'core'
  },
  credits: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  }
}, {
  tableName: 'subjects',
  timestamps: true
});

export default Subject;
