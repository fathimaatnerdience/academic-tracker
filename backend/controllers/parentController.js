import { Parent, User, Student, Teacher } from '../models/index.js';
import { Op } from 'sequelize';
import bcrypt from 'bcryptjs';

// @desc    Get all parents
// @route   GET /api/parents
// @access  Private (Admin, Teacher)
export const getParents = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;

    const where = search
      ? {
          [Op.or]: [
            { '$user.name$': { [Op.like]: `%${search}%` } },
            { '$user.email$': { [Op.like]: `%${search}%` } },
            { phone: { [Op.like]: `%${search}%` } }
          ]
        }
      : {};

    const { count, rows } = await Parent.findAndCountAll({
      where,
      include: [
        { 
          model: User, 
          as: 'user',
          attributes: ['id', 'name', 'email', 'username']
        },
        {
          model: Student,
          as: 'students',
          include: [{ model: User, as: 'user', attributes: ['name'] }]
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: rows,
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit),
      totalItems: count
    });
  } catch (error) {
    console.error('Error fetching parents:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single parent
// @route   GET /api/parents/:id
// @access  Private
export const getParent = async (req, res) => {
  try {
    const parent = await Parent.findByPk(req.params.id, {
      include: [
        { model: User, as: 'user' },
        {
          model: Student,
          as: 'students',
          include: [{ model: User, as: 'user' }]
        }
      ]
    });

    if (!parent) {
      return res.status(404).json({ success: false, message: 'Parent not found' });
    }

    res.status(200).json({ success: true, data: parent });
  } catch (error) {
    console.error('Error fetching parent:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create parent
// @route   POST /api/parents
// @access  Private (Admin only)
export const createParent = async (req, res) => {
  try {

    
// Support both formats: { parentData, studentIds } and { name, email, ... }
let parentData = req.body.parentData || req.body;
let studentIds = req.body.studentIds;

// Validate required fields
if (!parentData.name) {
  return res.status(400).json({ 
    success: false, 
    message: 'Name is required' 
  });
}
if (!parentData.relationship) {
  return res.status(400).json({ 
    success: false, 
    message: 'Relationship is required' 
  });
}


    // Note: User table should ONLY contain self-registered users
    // Admin-created parents are NOT added to User table
    // Store name, email directly in Parent table

    // Store name, email, phone, address directly in parent table
    let finalParentData = { ...parentData };
    finalParentData.name = parentData.name;
    finalParentData.email = parentData.email;
    finalParentData.phone = parentData.phone;
    finalParentData.address = parentData.address;
    
    // Store password directly in parent table
    if (parentData.password) {
      finalParentData.password = parentData.password;
    }

    // Create parent - userId is always null for admin-created parents
    const parent = await Parent.create({
      ...finalParentData,
      userId: null,
      parentId: 'PAR' + Date.now().toString(36).toUpperCase()
    });

    // Associate with students if provided
    if (studentIds && studentIds.length > 0) {
      const students = await Student.findAll({
        where: { id: studentIds }
      });
      await parent.setStudents(students);
    }

    // Fetch complete parent data
    const completeParent = await Parent.findByPk(parent.id, {
      include: [
        { model: User, as: 'user' },
        { model: Student, as: 'students' }
      ]
    });

    res.status(201).json({ 
      success: true, 
      data: completeParent 
    });
  } catch (error) {
    console.error('Error creating parent:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Update parent
// @route   PUT /api/parents/:id
// @access  Private (Admin only)
export const updateParent = async (req, res) => {
  try {
    const parent = await Parent.findByPk(req.params.id, {
      include: [{ model: User, as: 'user' }]
    });

    if (!parent) {
      return res.status(404).json({ 
        success: false, 
        message: 'Parent not found' 
      });
    }

    const { parentData, studentIds } = req.body;

    // Update parent information
    if (parentData) {
      const parentUpdates = {};
      if (parentData.phone) parentUpdates.phone = parentData.phone;
      if (parentData.address) parentUpdates.address = parentData.address;
      if (parentData.occupation) parentUpdates.occupation = parentData.occupation;
      if (parentData.relationship) parentUpdates.relationship = parentData.relationship;

      // Update password if provided
      if (parentData.password) {
        parentUpdates.password = parentData.password;
      }

      await parent.update(parentUpdates);
    }

    // Update student associations if provided
    if (studentIds && Array.isArray(studentIds)) {
      const students = await Student.findAll({
        where: { id: studentIds }
      });
      await parent.setStudents(students);
    }

    // Fetch updated parent
    const updatedParent = await Parent.findByPk(parent.id, {
      include: [
        { model: User, as: 'user' },
        { 
          model: Student, 
          as: 'students',
          include: [{ model: User, as: 'user' }]
        }
      ]
    });

    res.status(200).json({ 
      success: true, 
      data: updatedParent 
    });
  } catch (error) {
    console.error('Error updating parent:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Delete parent
// @route   DELETE /api/parents/:id
// @access  Private (Admin only)
export const deleteParent = async (req, res) => {
  try {
    const parent = await Parent.findByPk(req.params.id, {
      include: [{ model: User, as: 'user' }]
    });

    if (!parent) {
      return res.status(404).json({ 
        success: false, 
        message: 'Parent not found' 
      });
    }

    // Only delete the associated User if it exists and parent has userId
    if (parent.userId) {
      await User.destroy({ where: { id: parent.userId } });
    }

    await parent.destroy();

    res.status(200).json({ 
      success: true, 
      message: 'Parent deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting parent:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};
