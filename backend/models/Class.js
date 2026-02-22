import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Class = sequelize.define('Class', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'e.g., Grade 10-A, Class 5-B'
  },
  gradeLevel: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 12
    }
  },
  section: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 40
  },
  supervisorId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'teachers',
      key: 'id'
    },
    onDelete: 'SET NULL',
    comment: 'Class teacher/supervisor'
  },
  supervisorName: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Supervisor name (cached for display)'
  },
  academicYear: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'e.g., 2024'
  }
}, {
  tableName: 'classes',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['gradeLevel', 'section', 'academicYear']
    }
  ]
});

export default Class;
