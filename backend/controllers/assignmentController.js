import { Assignment, Subject, Class, Teacher, User } from '../models/index.js';
import { Op } from 'sequelize';

export const getAssignments = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', classId, subjectId, teacherId } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) where.title = { [Op.like]: `%${search}%` };
    if (classId) where.classId = classId;
    if (subjectId) where.subjectId = subjectId;
    if (teacherId) where.teacherId = teacherId;

    const { count, rows } = await Assignment.findAndCountAll({
      where,
      include: [
        { model: Subject, as: 'subject' },
        { model: Class, as: 'class' },
        { model: Teacher, as: 'teacher', include: [{ model: User, as: 'user' }] }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['dueDate', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: rows,
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit),
      totalItems: count
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findByPk(req.params.id, {
      include: [
        { model: Subject, as: 'subject' },
        { model: Class, as: 'class' },
        { model: Teacher, as: 'teacher' }
      ]
    });
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }
    res.status(200).json({ success: true, data: assignment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.create(req.body);
    res.status(201).json({ success: true, data: assignment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findByPk(req.params.id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }
    await assignment.update(req.body);
    res.status(200).json({ success: true, data: assignment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findByPk(req.params.id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }
    await assignment.destroy();
    res.status(200).json({ success: true, message: 'Assignment deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};