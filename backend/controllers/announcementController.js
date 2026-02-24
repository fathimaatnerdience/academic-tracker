import { Announcement, Class, User } from '../models/index.js';
import { Op } from 'sequelize';

export const getAnnouncements = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', classId, targetAudience } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) where.title = { [Op.like]: `%${search}%` };
    if (classId) where.classId = classId;
    if (targetAudience) where.targetAudience = targetAudience;

    const { count, rows } = await Announcement.findAndCountAll({
      where,
      include: [
        { model: Class, as: 'class' },
        { model: User, as: 'publisher' }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['publishDate', 'DESC']]
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

export const getAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByPk(req.params.id, {
      include: [
        { model: Class, as: 'class' },
        { model: User, as: 'publisher' }
      ]
    });
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }
    res.status(200).json({ success: true, data: announcement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createAnnouncement = async (req, res) => {
  try {
    // Use the authenticated user's ID for publishedBy instead of trusting frontend value
    // Remove any publishedBy from request body to prevent injection
    const { publishedBy, classId, ...rest } = req.body;
    
    // Validate classId if provided - must exist in database or be null/empty
    let validClassId = null;
    if (classId) {
      const classExists = await Class.findByPk(classId);
      if (classExists) {
        validClassId = classId;
      }
    }
    
    const announcementData = {
      ...rest,
      publishedBy: req.user.id,
      classId: validClassId
    };
    const announcement = await Announcement.create(announcementData);
    res.status(201).json({ success: true, data: announcement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByPk(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }
    await announcement.update(req.body);
    res.status(200).json({ success: true, data: announcement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByPk(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }
    await announcement.destroy();
    res.status(200).json({ success: true, message: 'Announcement deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};