import { Result, Student, Exam, Assignment, User, sequelize } from '../models/index.js';
import { Op } from 'sequelize';

export const getResults = async (req, res) => {
  try {
    const { page = 1, limit = 10, studentId, examId, assignmentId } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (studentId) where.studentId = studentId;
    if (examId) where.examId = examId;
    if (assignmentId) where.assignmentId = assignmentId;

    const { count, rows } = await Result.findAndCountAll({
      where,
      include: [
        { 
          model: Student, 
          as: 'student',
          include: [{ model: User, as: 'user' }] 
        },
        { model: Exam, as: 'exam' },
        { model: Assignment, as: 'assignment' }
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
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getResult = async (req, res) => {
  try {
    const result = await Result.findByPk(req.params.id, {
      include: [
        { model: Student, as: 'student' },
        { model: Exam, as: 'exam' },
        { model: Assignment, as: 'assignment' }
      ]
    });
    if (!result) {
      return res.status(404).json({ success: false, message: 'Result not found' });
    }
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createResult = async (req, res) => {
  try {
    let { studentId, examId, assignmentId, marksObtained, totalMarks } = req.body;

    // Convert empty strings to null for optional fields
    examId = examId === '' ? null : examId;
    assignmentId = assignmentId === '' ? null : assignmentId;

    // Validate that at least exam or assignment is provided
    if (!examId && !assignmentId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide either an exam or an assignment' 
      });
    }

    // Validate student exists by studentId (UUID)
    const student = await Student.findByPk(studentId);
    if (!student) {
      return res.status(400).json({ success: false, message: 'Student not found' });
    }

    // Validate examId if provided
    if (examId) {
      const exam = await Exam.findByPk(examId);
      if (!exam) {
        return res.status(400).json({ success: false, message: 'Exam not found' });
      }
    }

    // Validate assignmentId if provided
    if (assignmentId) {
      const assignment = await Assignment.findByPk(assignmentId);
      if (!assignment) {
        return res.status(400).json({ success: false, message: 'Assignment not found' });
      }
    }
    
    // Calculate percentage and grade
    const percentage = (marksObtained / totalMarks) * 100;
    let grade = 'F';
    if (percentage >= 90) grade = 'A+';
    else if (percentage >= 80) grade = 'A';
    else if (percentage >= 70) grade = 'B+';
    else if (percentage >= 60) grade = 'B';
    else if (percentage >= 50) grade = 'C';
    else if (percentage >= 40) grade = 'D';

    const result = await Result.create({
      studentId,
      examId,
      assignmentId,
      marksObtained,
      totalMarks,
      percentage,
      grade,
      remarks: req.body.remarks
    });
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateResult = async (req, res) => {
  try {
    const result = await Result.findByPk(req.params.id);
    if (!result) {
      return res.status(404).json({ success: false, message: 'Result not found' });
    }

    let { examId, assignmentId, marksObtained, totalMarks } = req.body;

    // Convert empty strings to null for optional fields
    examId = examId === '' ? null : examId;
    assignmentId = assignmentId === '' ? null : assignmentId;

    // Validate that at least exam or assignment is provided
    if (!examId && !assignmentId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide either an exam or an assignment' 
      });
    }

    // Validate examId if provided
    if (examId) {
      const exam = await Exam.findByPk(examId);
      if (!exam) {
        return res.status(400).json({ success: false, message: 'Exam not found' });
      }
    }

    // Validate assignmentId if provided
    if (assignmentId) {
      const assignment = await Assignment.findByPk(assignmentId);
      if (!assignment) {
        return res.status(400).json({ success: false, message: 'Assignment not found' });
      }
    }

    const percentage = (marksObtained / totalMarks) * 100;
    let grade = 'F';
    if (percentage >= 90) grade = 'A+';
    else if (percentage >= 80) grade = 'A';
    else if (percentage >= 70) grade = 'B+';
    else if (percentage >= 60) grade = 'B';
    else if (percentage >= 50) grade = 'C';
    else if (percentage >= 40) grade = 'D';

    await result.update({
      examId,
      assignmentId,
      marksObtained,
      totalMarks,
      percentage,
      grade,
      remarks: req.body.remarks
    });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteResult = async (req, res) => {
  try {
    const result = await Result.findByPk(req.params.id);
    if (!result) {
      return res.status(404).json({ success: false, message: 'Result not found' });
    }
    await result.destroy();
    res.status(200).json({ success: true, message: 'Result deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
