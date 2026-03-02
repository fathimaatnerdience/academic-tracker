import Student from '../models/Student.js';
import User from '../models/User.js';
import Class from '../models/Class.js';
import Parent from '../models/Parent.js';
import Teacher from '../models/Teacher.js';
import { ErrorResponse } from '../middleware/error.js';
import { Op } from 'sequelize';

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

    
// Build include array - make User include optional when no search
const include = [
  {
    model: User,
    as: 'user',
    where: Object.keys(userWhere).length > 0 ? userWhere : undefined,
    required: Object.keys(userWhere).length > 0,
    attributes: { exclude: ['password'] }
  },
  { model: Class, as: 'class' },
  { model: Parent, as: 'parent', include: [{ model: User, as: 'user' }] }
];

const { count, rows } = await Student.findAndCountAll({
  where,
  include,
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

    // Validate required fields
    if (!studentData) {
      return next(new ErrorResponse('Student data is required', 400));
    }
    // Check name in userData (from frontend)
    if (!userData || !userData.name) {
      return next(new ErrorResponse('Name is required', 400));
    }
    if (!studentData.dateOfBirth) {
      return next(new ErrorResponse('Date of birth is required', 400));
    }
    if (!studentData.gender) {
      return next(new ErrorResponse('Gender is required', 400));
    }

    // Note: User table should ONLY contain self-registered users
    // Admin-created students are NOT added to User table
    // Store name, email directly in Student table

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

    // Store name, email, phone, address directly in student table
    finalStudentData.name = userData.name;
    finalStudentData.email = userData.email;
    finalStudentData.phone = userData.phone;
    finalStudentData.address = userData.address;
    
    // Store password directly in student table
    if (userData.password) {
      finalStudentData.password = userData.password;
    }

    // Create student - userId is always null for admin-created students
    const student = await Student.create({
      ...finalStudentData,
      userId: null,
      studentId: `STU${Date.now()}`
    });

    // Fetch complete student with associations
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

    // Prepare update data
    let updateData = {};

    // Handle userData for admin-created students (stored in student table)
    if (userData && !student.userId) {
      updateData.name = userData.name;
      updateData.email = userData.email;
      updateData.address = userData.address;
    }

    // Handle studentData
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

      updateData = { ...updateData, ...finalStudentData };
    }

    // Update student
    await student.update(updateData);

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

    // Only delete the associated User if it exists and student has userId
    if (student.userId) {
      await User.destroy({ where: { id: student.userId } });
    }

    await student.destroy();

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
