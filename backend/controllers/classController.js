import { Class, Teacher, Student, User } from '../models/index.js';
import { Op } from 'sequelize';

export const getClasses = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;

    const where = search
      ? { name: { [Op.like]: `%${search}%` } }
      : {};

    const { count, rows } = await Class.findAndCountAll({
      where,
      include: [
        { model: Teacher, as: 'supervisor', include: [{ model: User, as: 'user' }] },
        { model: Student, as: 'students', include: [{ model: User, as: 'user' }] }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    // Add supervisorName directly to each class object
    const data = rows.map(classItem => {
      const classData = classItem.toJSON();
      // Check both teacher.name (admin-created) and user.name (self-registered)
      classData.supervisorName = classData.supervisor?.name || classData.supervisor?.user?.name || null;
      return classData;
    });

    res.status(200).json({
      success: true,
      data: data,
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit),
      totalItems: count
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getClass = async (req, res) => {
  try {
    const classData = await Class.findByPk(req.params.id, {
      include: [
        { model: Teacher, as: 'supervisor', include: [{ model: User, as: 'user' }] },
        { model: Student, as: 'students', include: [{ model: User, as: 'user' }] }
      ]
    });

    if (!classData) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    const data = classData.toJSON();
    data.supervisorName = data.supervisor?.name || data.supervisor?.user?.name || null;

    res.status(200).json({ success: true, data: data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createClass = async (req, res) => {
  try {
    const { name, gradeLevel, section, capacity, supervisorId, academicYear } = req.body;

    // Validate required fields
    if (!name || !gradeLevel || !section || !academicYear) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields: name, gradeLevel, section, academicYear' 
      });
    }

    // Get supervisor name if supervisorId is provided
    let supervisorName = null;
    if (supervisorId) {
      const teacher = await Teacher.findByPk(supervisorId, {
        include: [{ model: User, as: 'user' }]
      });
      if (teacher) {
        // Check both teacher.name (admin-created) and user.name (self-registered)
        supervisorName = teacher.name || teacher.user?.name || null;
      }
    }

    const classData = await Class.create({
      name,
      gradeLevel,
      section,
      capacity,
      supervisorId,
      supervisorName,
      academicYear
    });

    res.status(201).json({ success: true, data: classData });
  } catch (error) {
    // Handle unique constraint error
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ 
        success: false, 
        message: 'A class with this grade level, section, and academic year already exists' 
      });
    }
    
    // Handle validation errors
    if (error.name === 'SequelizeValidationError') {
      const validationMessages = error.errors.map(err => err.message);
      return res.status(400).json({ 
        success: false, 
        message: validationMessages.join(', ') 
      });
    }
    
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateClass = async (req, res) => {
  try {
    const classData = await Class.findByPk(req.params.id);

    if (!classData) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    // If supervisorId is being updated, also update supervisorName
    if (req.body.supervisorId !== undefined) {
      if (req.body.supervisorId) {
        const teacher = await Teacher.findByPk(req.body.supervisorId, {
          include: [{ model: User, as: 'user' }]
        });
        // Check both teacher.name (admin-created) and user.name (self-registered)
        req.body.supervisorName = teacher?.name || teacher?.user?.name || null;
      } else {
        req.body.supervisorName = null;
      }
    }

    await classData.update(req.body);
    res.status(200).json({ success: true, data: classData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteClass = async (req, res) => {
  try {
    const classData = await Class.findByPk(req.params.id);

    if (!classData) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    await classData.destroy();
    res.status(200).json({ success: true, message: 'Class deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
