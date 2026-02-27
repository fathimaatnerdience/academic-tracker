import { Attendance, Student, Lesson, Subject, User } from '../models/index.js';
import { Op } from 'sequelize';

export const getAttendances = async (req, res) => {
  try {
    const { page = 1, limit = 10, studentId, lessonId, date } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (studentId) where.studentId = studentId;
    if (lessonId) where.lessonId = lessonId;
    if (date) where.date = date;

    const { count, rows } = await Attendance.findAndCountAll({
      where,
      include: [
        { model: Student, as: 'student', include: [{ model: User, as: 'user' }] },
        { model: Lesson, as: 'lesson', include: [{ model: Subject, as: 'subject' }] }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['date', 'DESC'], ['createdAt', 'DESC']]
    });

    // Map to include subject directly
    const data = rows.map(item => ({
      ...item.toJSON(),
      subject: item.lesson?.subject
    }));

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

export const getAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByPk(req.params.id, {
      include: [
        { model: Student, as: 'student' },
        { model: Lesson, as: 'lesson', include: [{ model: Subject, as: 'subject' }] }
      ]
    });
    if (!attendance) {
      return res.status(404).json({ success: false, message: 'Attendance not found' });
    }
    
    const data = {
      ...attendance.toJSON(),
      subject: attendance.lesson?.subject
    };
    
    res.status(200).json({ success: true, data: data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.create(req.body);
    res.status(201).json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByPk(req.params.id);
    if (!attendance) {
      return res.status(404).json({ success: false, message: 'Attendance not found' });
    }
    await attendance.update(req.body);
    res.status(200).json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByPk(req.params.id);
    if (!attendance) {
      return res.status(404).json({ success: false, message: 'Attendance not found' });
    }
    await attendance.destroy();
    res.status(200).json({ success: true, message: 'Attendance deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
