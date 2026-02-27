import Teacher from '../models/Teacher.js';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Parent from '../models/Parent.js';
import { ErrorResponse } from '../middleware/error.js';
import { Op } from 'sequelize';

// @desc    Get all teachers
// @route   GET /api/teachers
// @access  Private (Admin, Teacher)
export const getTeachers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;
    
    // For teachers, we search directly in Teacher table
    const where = search ? {
      [Op.or]: [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ]
    } : {};

    const { count, rows } = await Teacher.findAndCountAll({
      where,
      include: [{
        model: User,
        as: 'user',
        attributes: { exclude: ['password'] }
      }],
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

// @desc    Get single teacher
// @route   GET /api/teachers/:id
// @access  Private
export const getTeacher = async (req, res, next) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id, {
      include: [{ 
        model: User, 
        as: 'user',
        attributes: { exclude: ['password'] }
      }]
    });

    if (!teacher) {
      return next(new ErrorResponse('Teacher not found', 404));
    }

    res.status(200).json({
      success: true,
      data: teacher
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new teacher
// @route   POST /api/teachers
// @access  Private (Admin)
export const createTeacher = async (req, res, next) => {
  try {
    const { userData, teacherData } = req.body;

    // Validate required fields
    if (!teacherData) {
      return next(new ErrorResponse('Teacher data is required', 400));
    }
    // Check name in userData (from frontend)
    if (!userData || !userData.name) {
      return next(new ErrorResponse('Name is required', 400));
    }
    if (!teacherData.dateOfBirth) {
      return next(new ErrorResponse('Date of birth is required', 400));
    }
    if (!teacherData.gender) {
      return next(new ErrorResponse('Gender is required', 400));
    }
    if (!teacherData.qualification) {
      return next(new ErrorResponse('Qualification is required', 400));
    }
    if (!teacherData.joiningDate) {
      return next(new ErrorResponse('Joining date is required', 400));
    }

    // Create User record for the teacher so they can login
    const email = userData.email;
    const password = userData.password || 'teacher123'; // Default password if not provided
    
    // Check if user already exists with this email
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return next(new ErrorResponse('User already exists with this email', 400));
    }

    // Create user with role 'teacher'
    const user = await User.create({
      username: userData.name,
      email: email,
      password: password,
      role: 'teacher',
      name: userData.name
    });

    // Store name, email, phone, address directly in teacher table
    let finalTeacherData = { ...teacherData };
    finalTeacherData.name = userData.name;
    finalTeacherData.email = userData.email;
    finalTeacherData.phone = userData.phone;
    finalTeacherData.address = userData.address;

    // Create teacher with link to user
    const teacher = await Teacher.create({
      ...finalTeacherData,
      userId: user.id,
      teacherId: `TCH${Date.now()}`
    });

    // Fetch complete teacher with associations
    const completeTeacher = await Teacher.findByPk(teacher.id, {
      include: [{ 
        model: User, 
        as: 'user',
        attributes: { exclude: ['password'] }
      }]
    });

    res.status(201).json({
      success: true,
      data: completeTeacher
    });
  } catch (error) {
    console.error('Error creating teacher:', error);
    next(error);
  }
};

// @desc    Update teacher
// @route   PUT /api/teachers/:id
// @access  Private (Admin)
export const updateTeacher = async (req, res, next) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id);

    if (!teacher) {
      return next(new ErrorResponse('Teacher not found', 404));
    }

    const { teacherData } = req.body;

    if (teacherData) {
      await teacher.update(teacherData);
    }

    const updatedTeacher = await Teacher.findByPk(teacher.id, {
      include: [{ 
        model: User, 
        as: 'user',
        attributes: { exclude: ['password'] }
      }]
    });

    res.status(200).json({
      success: true,
      data: updatedTeacher
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete teacher
// @route   DELETE /api/teachers/:id
// @access  Private (Admin)
export const deleteTeacher = async (req, res, next) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id);

    if (!teacher) {
      return next(new ErrorResponse('Teacher not found', 404));
    }

    // Only delete the associated User if it exists and teacher has userId
    if (teacher.userId) {
      await User.destroy({ where: { id: teacher.userId } });
    }

    await teacher.destroy();

    res.status(200).json({
      success: true,
      message: 'Teacher deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getTeachers,
  getTeacher,
  createTeacher,
  updateTeacher,
  deleteTeacher
};
