import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Assignment = sequelize.define('Assignment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  subjectId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'subjects',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  classId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'classes',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  teacherId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'teachers',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  totalMarks: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 10
  },
  attachments: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Array of file URLs'
  }
}, {
  tableName: 'assignments',
  timestamps: true
});

export default Assignment;
