import { Announcement, Class, User } from '../models/index.js';
import { Op } from 'sequelize';

export const getAnnouncements = async (req, res, next) => {
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
    next(error);
  }
};

export const getAnnouncement = async (req, res, next) => {
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
    next(error);
  }
};

export const createAnnouncement = async (req, res, next) => {
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
    next(error);
  }
};

export const updateAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findByPk(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    // Validate new classId if it's being changed
    const { classId, publishedBy, ...rest } = req.body;
    let validClassId = announcement.classId; // default to existing
    if (classId !== undefined) {
      if (classId === '' || classId === null) {
        validClassId = null;
      } else {
        const classExists = await Class.findByPk(classId);
        if (classExists) {
          validClassId = classId;
        } else {
          // invalid classId provided -> ignore it rather than throw
          validClassId = null;
        }
      }
    }

    // ensure publishedBy is not overwritten
    const updateData = {
      ...rest,
      classId: validClassId
    };

    await announcement.update(updateData);
    res.status(200).json({ success: true, data: announcement });
  } catch (error) {
    next(error);
  }
};

export const deleteAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findByPk(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }
    await announcement.destroy();
    res.status(200).json({ success: true, message: 'Announcement deleted' });
  } catch (error) {
    next(error);
  }
};