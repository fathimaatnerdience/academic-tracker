import { Lesson, Subject, Class, Teacher, User } from '../models/index.js';
import { Op } from 'sequelize';

export const getLessons = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', classId, teacherId, dayOfWeek } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) where['$subject.name$'] = { [Op.like]: `%${search}%` };
    if (classId) where.classId = classId;
    if (teacherId) where.teacherId = teacherId;
    if (dayOfWeek) where.dayOfWeek = dayOfWeek;

    const { count, rows } = await Lesson.findAndCountAll({
      where,
      include: [
        { model: Subject, as: 'subject' },
        { model: Class, as: 'class' },
        { model: Teacher, as: 'teacher', include: [{ model: User, as: 'user' }] }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['dayOfWeek', 'ASC'], ['startTime', 'ASC']]
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

export const getLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findByPk(req.params.id, {
      include: [
        { model: Subject, as: 'subject' },
        { model: Class, as: 'class' },
        { model: Teacher, as: 'teacher' }
      ]
    });

    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    res.status(200).json({ success: true, data: lesson });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createLesson = async (req, res) => {
  try {
    const lesson = await Lesson.create(req.body);
    res.status(201).json({ success: true, data: lesson });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findByPk(req.params.id);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }
    await lesson.update(req.body);
    res.status(200).json({ success: true, data: lesson });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findByPk(req.params.id);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }
    await lesson.destroy();
    res.status(200).json({ success: true, message: 'Lesson deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};