import { Subject } from '../models/index.js';
import { Op } from 'sequelize';

// @desc    Get all subjects
// @route   GET /api/subjects
// @access  Private
export const getSubjects = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;

    const where = search
      ? {
          [Op.or]: [
            { subjectName: { [Op.like]: `%${search}%` } },
            { code: { [Op.like]: `%${search}%` } }
          ]
        }
      : {};

    const { count, rows } = await Subject.findAndCountAll({
      where,
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
    console.error('Error fetching subjects:', error);
    next(error);
  }
};

// @desc    Get single subject
// @route   GET /api/subjects/:id
// @access  Private
export const getSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findByPk(req.params.id);

    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    res.status(200).json({ success: true, data: subject });
  } catch (error) {
    console.error('Error fetching subject:', error);
    next(error);
  }
};

// @desc    Create subject
// @route   POST /api/subjects
// @access  Private (Admin only)
export const createSubject = async (req, res, next) => {
  try {
    const { subjectName, code, description, gradeLevel, type, credits } = req.body;

    // Generate subject code if not provided
    const subjectCode = code || `SUB${Date.now().toString().slice(-6)}`;

    const subject = await Subject.create({
      subjectName,
      code: subjectCode,
      description,
      gradeLevel,
      type,
      credits
    });

    res.status(201).json({ success: true, data: subject });
  } catch (error) {
    console.error('Error creating subject:', error);
    next(error);
  }
};

// @desc    Update subject
// @route   PUT /api/subjects/:id
// @access  Private (Admin only)
export const updateSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findByPk(req.params.id);

    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    await subject.update(req.body);

    res.status(200).json({ success: true, data: subject });
  } catch (error) {
    console.error('Error updating subject:', error);
    next(error);
  }
};

// @desc    Delete subject
// @route   DELETE /api/subjects/:id
// @access  Private (Admin only)
export const deleteSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findByPk(req.params.id);

    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    await subject.destroy();

    res.status(200).json({ success: true, message: 'Subject deleted successfully' });
  } catch (error) {
    console.error('Error deleting subject:', error);
    next(error);
  }
};
