import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Exam = sequelize.define('Exam', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
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
  examDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  startTime: {
    type: DataTypes.TIME,
    allowNull: false
  },
  endTime: {
    type: DataTypes.TIME,
    allowNull: false
  },
  totalMarks: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 100
  },
  passingMarks: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 40
  },
  examType: {
    type: DataTypes.ENUM('midterm', 'final', 'quiz', 'unit_test'),
    allowNull: false,
    defaultValue: 'midterm'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'exams',
  timestamps: true
});

export default Exam;
