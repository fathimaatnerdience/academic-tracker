import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import Parent from '../models/Parent.js';
import Class from '../models/Class.js';
import User from '../models/User.js';
import { Op } from 'sequelize';

// @desc    Global search across all entities
// @route   GET /api/search
// @access  Private
export const globalSearch = async (req, res, next) => {
  try {
    const { q, type } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(200).json({
        success: true,
        results: []
      });
    }

    const searchTerm = q.trim();
    const limit = 10;
    const results = [];

    // Search Students
    if (!type || type === 'students') {
      const students = await Student.findAll({
        where: {
          [Op.or]: [
            { name: { [Op.like]: `%${searchTerm}%` } },
            { email: { [Op.like]: `%${searchTerm}%` } },
            { studentId: { [Op.like]: `%${searchTerm}%` } }
          ]
        },
        include: [{ model: Class, as: 'class' }],
        limit
      });
      
      results.push(...students.map(s => ({
        type: 'student',
        id: s.id,
        name: s.name,
        email: s.email,
        additionalInfo: s.class?.name || 'No class'
      })));
    }

    // Search Teachers
    if (!type || type === 'teachers') {
      const teachers = await Teacher.findAll({
        where: {
          [Op.or]: [
            { name: { [Op.like]: `%${searchTerm}%` } },
            { email: { [Op.like]: `%${searchTerm}%` } },
            { employeeId: { [Op.like]: `%${searchTerm}%` } }
          ]
        },
        limit
      });
      
      results.push(...teachers.map(t => ({
        type: 'teacher',
        id: t.id,
        name: t.name,
        email: t.email,
        additionalInfo: t.subject || 'No subject'
      })));
    }

    // Search Parents
    if (!type || type === 'parents') {
      const parents = await Parent.findAll({
        where: {
          [Op.or]: [
            { name: { [Op.like]: `%${searchTerm}%` } },
            { email: { [Op.like]: `%${searchTerm}%` } },
            { phone: { [Op.like]: `%${searchTerm}%` } }
          ]
        },
        limit
      });
      
      results.push(...parents.map(p => ({
        type: 'parent',
        id: p.id,
        name: p.name,
        email: p.email,
        additionalInfo: p.phone || 'No phone'
      })));
    }

    // Search Classes
    if (!type || type === 'classes') {
      const classes = await Class.findAll({
        where: {
          [Op.or]: [
            { name: { [Op.like]: `%${searchTerm}%` } },
            { gradeLevel: { [Op.like]: `%${searchTerm}%` } },
            { section: { [Op.like]: `%${searchTerm}%` } }
          ]
        },
        limit
      });
      
      results.push(...classes.map(c => ({
        type: 'class',
        id: c.id,
        name: c.name,
        additionalInfo: `Grade ${c.gradeLevel} - ${c.section}`
      })));
    }

    // Sort by relevance (exact match first, then contains)
    results.sort((a, b) => {
      const aExact = a.name.toLowerCase() === searchTerm.toLowerCase();
      const bExact = b.name.toLowerCase() === searchTerm.toLowerCase();
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      return 0;
    });

    res.status(200).json({
      success: true,
      results: results.slice(0, 20)
    });
  } catch (error) {
    next(error);
  }
};

export default { globalSearch };
