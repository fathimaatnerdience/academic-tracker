import { Attendance, Student } from '../models/index.js';
import { Op, fn, col, literal } from 'sequelize';

// Helper to convert a date string/Date to weekday abbreviation
const getWeekday = (date) => {
  try {
    return new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
  } catch {
    return date;
  }
};

// @desc    Get attendance counts per day split by gender
// @route   GET /api/dashboard/attendance-chart
// @access  Private
export const getAttendanceChart = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const where = {};
    if (startDate) {
      where.date = { [Op.gte]: startDate };
    }
    if (endDate) {
      where.date = {
        ...(where.date || {}),
        [Op.lte]: endDate
      };
    }

    const rows = await Attendance.findAll({
      where,
      include: [{ model: Student, as: 'student', attributes: ['gender'] }],
      attributes: [
        'date',
        [
          fn('SUM', literal("CASE WHEN `student`.`gender`='male' THEN 1 ELSE 0 END")),
          'boys'
        ],
        [
          fn('SUM', literal("CASE WHEN `student`.`gender`='female' THEN 1 ELSE 0 END")),
          'girls'
        ]
      ],
      group: ['date'],
      raw: true
    });

    const byDay = {};
    rows.forEach(r => {
      const weekday = getWeekday(r.date);
      const boys = parseInt(r.boys, 10) || 0;
      const girls = parseInt(r.girls, 10) || 0;
      if (!byDay[weekday]) {
        byDay[weekday] = { boys: 0, girls: 0 };
      }
      byDay[weekday].boys += boys;
      byDay[weekday].girls += girls;
    });

    const order = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    const formatted = Object.keys(byDay)
      .sort((a,b) => order.indexOf(a) - order.indexOf(b))
      .map(day => ({
        day,
        boys: byDay[day].boys,
        girls: byDay[day].girls
      }));

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    next(error);
  }
};