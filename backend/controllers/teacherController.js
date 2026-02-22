import Teacher from '../models/Teacher.js';
import User from '../models/User.js';
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

export const getTeachers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;
    
    const userWhere = search ? {
      [Op.or]: [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ]
    } : {};

    const { count, rows } = await Teacher.findAndCountAll({
      include: [{
        model: User,
        as: 'user',
        where: userWhere,
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

export const createTeacher = async (req, res, next) => {
  try {
    const { userData, teacherData } = req.body;

    // Validate required fields
    if (!userData) {
      return next(new ErrorResponse('User data is required', 400));
    }
    if (!userData.email) {
      return next(new ErrorResponse('Email is required', 400));
    }
    if (!userData.name) {
      return next(new ErrorResponse('Name is required', 400));
    }
    if (!teacherData) {
      return next(new ErrorResponse('Teacher data is required', 400));
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
    const username = await generateUniqueUsername(baseUsername || 'teacher');

    // Create user with default password if not provided
    const password = userData.password || 'teacher123';

    // Create user
    const user = await User.create({
      ...userData,
      username,
      password,
      role: 'teacher'
    });

    // Create teacher
    const teacher = await Teacher.create({
      ...teacherData,
      userId: user.id,
      teacherId: `TCH${Date.now()}`
    });

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

export const updateTeacher = async (req, res, next) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id);

    if (!teacher) {
      return next(new ErrorResponse('Teacher not found', 404));
    }

    const { userData, teacherData } = req.body;

    if (userData) {
      const user = await User.findByPk(teacher.userId);
      // Generate username if not provided but name is being updated
      if (!userData.username && userData.name) {
        userData.username = await generateUniqueUsername(
          userData.name.toLowerCase().replace(/\s+/g, '.')
        );
      }
      await user.update(userData);
    }

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

export const deleteTeacher = async (req, res, next) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id);

    if (!teacher) {
      return next(new ErrorResponse('Teacher not found', 404));
    }

    await User.destroy({ where: { id: teacher.userId } });

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
