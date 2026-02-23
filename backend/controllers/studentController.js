import Student from '../models/Student.js';
import User from '../models/User.js';
import Class from '../models/Class.js';
import Parent from '../models/Parent.js';
import { ErrorResponse } from '../middleware/error.js';
import { Op } from 'sequelize';

// Helper function to generate unique username
const generateUniqueUsername = async (baseUsername) => {
  let username = baseUsername.toLowerCase().replace(/\s+/g, '.');
  let counter = 0;
  let finalUsername = username;
  
  while (true) {
    const existingUser = await User.findOne({ where: { username: finalUsername } });
    if (!existingUser) break;
    counter++;
    finalUsername = `${username}${counter}`;
  }
  
  return finalUsername;
};

// @desc    Get all students
// @route   GET /api/students
// @access  Private (Admin, Teacher)
export const getStudents = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, classId, gradeLevel } = req.query;
    
    const offset = (page - 1) * limit;
    
    // Build where clause
    const where = {};
    if (classId) where.classId = classId;
    if (gradeLevel) where.gradeLevel = gradeLevel;

    // Build user search
    const userWhere = {};
    if (search) {
      userWhere[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Student.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          where: userWhere,
          attributes: { exclude: ['password'] }
        },
        { model: Class, as: 'class' },
        { model: Parent, as: 'parent', include: [{ model: User, as: 'user' }] }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      data: rows
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single student
// @route   GET /api/students/:id
// @access  Private
export const getStudent = async (req, res, next) => {
  try {
    const student = await Student.findByPk(req.params.id, {
      include: [
        { 
          model: User, 
          as: 'user',
          attributes: { exclude: ['password'] }
        },
        { model: Class, as: 'class' },
        { 
          model: Parent, 
          as: 'parent',
          include: [{ model: User, as: 'user' }]
        }
      ]
    });

    if (!student) {
      return next(new ErrorResponse('Student not found', 404));
    }

    res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new student
// @route   POST /api/students
// @access  Private (Admin)
export const createStudent = async (req, res, next) => {
  try {
    const { userData, studentData } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ where: { email: userData.email } });
    if (userExists) {
      return next(new ErrorResponse('User already exists with this email', 400));
    }

    // Generate username from name or email if not provided
    const baseUsername = userData.username || 
      (userData.name ? userData.name.toLowerCase().replace(/\s+/g, '.') : null) ||
      userData.email.split('@')[0];

    // Generate unique username
    const username = await generateUniqueUsername(baseUsername || 'student');

    // Create user
    const user = await User.create({
      ...userData,
      username,
      role: 'student'
    });

    // If classId is provided, get gradeLevel and section from Class
    let finalStudentData = { ...studentData };
    
    if (finalStudentData.classId) {
      try {
        const classRecord = await Class.findByPk(finalStudentData.classId);
        if (classRecord) {
          finalStudentData.gradeLevel = classRecord.gradeLevel;
          finalStudentData.section = classRecord.section;
        }
      } catch (err) {
        console.error('Error fetching class for gradeLevel and section:', err);
      }
    }

    // If no classId and no gradeLevel provided, set gradeLevel to null
    if (!finalStudentData.gradeLevel && !finalStudentData.classId) {
      finalStudentData.gradeLevel = null;
    }

    // If no classId, set section to null
    if (!finalStudentData.classId) {
      finalStudentData.section = null;
    }

    // Create student
    const student = await Student.create({
      ...finalStudentData,
      userId: user.id,
      studentId: `STU${Date.now()}`
    });

    // Fetch complete student data
    const completeStudent = await Student.findByPk(student.id, {
      include: [
        { 
          model: User, 
          as: 'user',
          attributes: { exclude: ['password'] }
        },
        { model: Class, as: 'class' },
        { model: Parent, as: 'parent' }
      ]
    });

    res.status(201).json({
      success: true,
      data: completeStudent
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private (Admin)
export const updateStudent = async (req, res, next) => {
  try {
    const student = await Student.findByPk(req.params.id);

    if (!student) {
      return next(new ErrorResponse('Student not found', 404));
    }

    const { userData, studentData } = req.body;

    // Update user data
    if (userData) {
      const user = await User.findByPk(student.userId);
      // Generate username if not provided but name is being updated
      if (!userData.username && userData.name) {
        userData.username = await generateUniqueUsername(
          userData.name.toLowerCase().replace(/\s+/g, '.')
        );
      }
      await user.update(userData);
    }

    // Update student data - if classId is changed, also update gradeLevel and section
    if (studentData) {
      let finalStudentData = { ...studentData };
      
      if (finalStudentData.classId) {
        try {
          const classRecord = await Class.findByPk(finalStudentData.classId);
          if (classRecord) {
            finalStudentData.gradeLevel = classRecord.gradeLevel;
            finalStudentData.section = classRecord.section;
          }
        } catch (err) {
          console.error('Error fetching class for gradeLevel and section:', err);
        }
      } else {
        // If no classId provided, set gradeLevel and section to null
        finalStudentData.gradeLevel = null;
        finalStudentData.section = null;
      }
      
      await student.update(finalStudentData);
    }

    // Fetch updated student
    const updatedStudent = await Student.findByPk(student.id, {
      include: [
        { 
          model: User, 
          as: 'user',
          attributes: { exclude: ['password'] }
        },
        { model: Class, as: 'class' },
        { model: Parent, as: 'parent' }
      ]
    });

    res.status(200).json({
      success: true,
      data: updatedStudent
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private (Admin)
export const deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findByPk(req.params.id);

    if (!student) {
      return next(new ErrorResponse('Student not found', 404));
    }

    // Delete user (cascade will delete student)
    await User.destroy({ where: { id: student.userId } });

    res.status(200).json({
      success: true,
      message: 'Student deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent
};
