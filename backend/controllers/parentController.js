import { Parent, User, Student } from '../models/index.js';
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
    const { 
      name, 
      email, 
      password, 
      username,
      phone, 
      address, 
      occupation,
      relationship,
      studentIds
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      where: { 
        [Op.or]: [{ email }, { username }] 
      } 
    });

    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email or username already exists' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      username: username || email.split('@')[0],
      password: hashedPassword,
      role: 'parent'
    });

    // Create parent
    const parent = await Parent.create({
      userId: user.id,
      parentId: 'PAR' + Date.now().toString(36).toUpperCase(),
      phone,
      address,
      occupation,
      relationship: relationship || 'father'
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

    const { 
      name, 
      email, 
      username,
      phone, 
      address, 
      occupation,
      relationship,
      studentIds 
    } = req.body;

    // Update user information
    if (name || email || username) {
      const userUpdates = {};
      if (name) userUpdates.name = name;
      if (email) userUpdates.email = email;
      if (username) userUpdates.username = username;

      await parent.user.update(userUpdates);
    }

    // Update parent information
    const parentUpdates = {};
    if (phone) parentUpdates.phone = phone;
    if (address) parentUpdates.address = address;
    if (occupation) parentUpdates.occupation = occupation;
    if (relationship) parentUpdates.relationship = relationship;

    await parent.update(parentUpdates);

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

    // Delete parent and associated user
    await parent.destroy();
    await parent.user.destroy();

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
