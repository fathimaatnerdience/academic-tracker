import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Result = sequelize.define('Result', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  studentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'students',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  examId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'exams',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  assignmentId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'assignments',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  marksObtained: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false
  },
  totalMarks: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  percentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  grade: {
    type: DataTypes.STRING(5),
    allowNull: true
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'results',
  timestamps: true,
  hooks: {
    beforeSave: (result) => {
      // Auto-calculate percentage
      result.percentage = ((result.marksObtained / result.totalMarks) * 100).toFixed(2);
      
      // Auto-assign grade
      const percentage = result.percentage;
      if (percentage >= 90) result.grade = 'A+';
      else if (percentage >= 80) result.grade = 'A';
      else if (percentage >= 70) result.grade = 'B+';
      else if (percentage >= 60) result.grade = 'B';
      else if (percentage >= 50) result.grade = 'C';
      else if (percentage >= 40) result.grade = 'D';
      else result.grade = 'F';
    }
  }
});

export default Result;
