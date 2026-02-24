import { sequelize } from '../config/database.js';
import User from './User.js';
import Student from './Student.js';
import Teacher from './Teacher.js';
import Parent from './Parent.js';
import Class from './Class.js';
import Subject from './Subject.js';
import Lesson from './Lesson.js';
import Exam from './Exam.js';
import Assignment from './Assignment.js';
import Result from './Result.js';
import Attendance from './Attendance.js';
import Event from './Event.js';
import Announcement from './Announcement.js';

// ========================================
// Define Associations
// ========================================

// User associations - Add indexes: false to prevent creating too many indexes
User.hasOne(Student, { foreignKey: 'userId', as: 'student', indexes: false });
User.hasOne(Teacher, { foreignKey: 'userId', as: 'teacher', indexes: false });
User.hasOne(Parent, { foreignKey: 'userId', as: 'parent', indexes: false });

// Student associations
Student.belongsTo(User, { foreignKey: 'userId', as: 'user', indexes: false });
Student.belongsTo(Class, { foreignKey: 'classId', as: 'class' });
Student.belongsTo(Parent, { foreignKey: 'parentId', as: 'parent' });
Student.hasMany(Result, { foreignKey: 'studentId', as: 'results' });
Student.hasMany(Attendance, { foreignKey: 'studentId', as: 'attendances' });

// Teacher associations
Teacher.belongsTo(User, { foreignKey: 'userId', as: 'user', indexes: false });
Teacher.hasMany(Class, { foreignKey: 'supervisorId', as: 'supervisedClasses' });
Teacher.hasMany(Lesson, { foreignKey: 'teacherId', as: 'lessons' });
Teacher.hasMany(Exam, { foreignKey: 'teacherId', as: 'exams' });
Teacher.hasMany(Assignment, { foreignKey: 'teacherId', as: 'assignments' });

// Parent associations
Parent.belongsTo(User, { foreignKey: 'userId', as: 'user', indexes: false });
Parent.hasMany(Student, { foreignKey: 'parentId', as: 'students' });

// Class associations
Class.belongsTo(Teacher, { foreignKey: 'supervisorId', as: 'supervisor' });
Class.hasMany(Student, { foreignKey: 'classId', as: 'students' });
Class.hasMany(Lesson, { foreignKey: 'classId', as: 'lessons' });
Class.hasMany(Exam, { foreignKey: 'classId', as: 'exams' });
Class.hasMany(Assignment, { foreignKey: 'classId', as: 'assignments' });
Class.hasMany(Event, { foreignKey: 'classId', as: 'events' });
Class.hasMany(Announcement, { foreignKey: 'classId', as: 'announcements' });

// Subject associations
Subject.hasMany(Lesson, { foreignKey: 'subjectId', as: 'lessons' });
Subject.hasMany(Exam, { foreignKey: 'subjectId', as: 'exams' });
Subject.hasMany(Assignment, { foreignKey: 'subjectId', as: 'assignments' });

// Lesson associations
Lesson.belongsTo(Subject, { foreignKey: 'subjectId', as: 'subject' });
Lesson.belongsTo(Class, { foreignKey: 'classId', as: 'class' });
Lesson.belongsTo(Teacher, { foreignKey: 'teacherId', as: 'teacher' });
Lesson.hasMany(Attendance, { foreignKey: 'lessonId', as: 'attendances' });

// Exam associations
Exam.belongsTo(Subject, { foreignKey: 'subjectId', as: 'subject' });
Exam.belongsTo(Class, { foreignKey: 'classId', as: 'class' });
Exam.belongsTo(Teacher, { foreignKey: 'teacherId', as: 'teacher' });
Exam.hasMany(Result, { foreignKey: 'examId', as: 'results' });

// Assignment associations
Assignment.belongsTo(Subject, { foreignKey: 'subjectId', as: 'subject' });
Assignment.belongsTo(Class, { foreignKey: 'classId', as: 'class' });
Assignment.belongsTo(Teacher, { foreignKey: 'teacherId', as: 'teacher' });
Assignment.hasMany(Result, { foreignKey: 'assignmentId', as: 'results' });

// Result associations - studentId is now UUID referencing Student's id
Result.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
Result.belongsTo(Exam, { foreignKey: 'examId', as: 'exam' });
Result.belongsTo(Assignment, { foreignKey: 'assignmentId', as: 'assignment' });

// Attendance associations
Attendance.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
Attendance.belongsTo(Lesson, { foreignKey: 'lessonId', as: 'lesson' });

// Event associations
Event.belongsTo(Class, { foreignKey: 'classId', as: 'class' });
Event.belongsTo(User, { foreignKey: 'organizerId', as: 'organizer' });

// Announcement associations
Announcement.belongsTo(Class, { foreignKey: 'classId', as: 'class' });
Announcement.belongsTo(User, { foreignKey: 'publishedBy', as: 'publisher' });

// ========================================
// Export all models
// ========================================

export {
  sequelize,
  User,
  Student,
  Teacher,
  Parent,
  Class,
  Subject,
  Lesson,
  Exam,
  Assignment,
  Result,
  Attendance,
  Event,
  Announcement
};

// Also export as default for easy importing
export default {
  sequelize,
  User,
  Student,
  Teacher,
  Parent,
  Class,
  Subject,
  Lesson,
  Exam,
  Assignment,
  Result,
  Attendance,
  Event,
  Announcement
};
