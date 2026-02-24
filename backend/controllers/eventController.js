import { Event, Class } from '../models/index.js';
import { Op } from 'sequelize';

export const getEvents = async (req, res) => {
  try {
    console.log('Fetching events, user:', req.user);
    const { page = 1, limit = 10, search = '', classId, eventType } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) where.title = { [Op.like]: `%${search}%` };
    if (classId) where.classId = classId;
    if (eventType) where.eventType = eventType;

    // Exclude organizerId as it doesn't exist in the database
    const { count, rows } = await Event.findAndCountAll({
      where,
      attributes: { exclude: ['organizerId'] },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['startDate', 'DESC']]
    });

    console.log('Events fetched successfully:', count);
    
    res.status(200).json({
      success: true,
      data: rows,
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit),
      totalItems: count
    });
  } catch (error) {
    console.error('Error in getEvents:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getEvent = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id, {
      attributes: { exclude: ['organizerId'] },
      include: [
        { model: Class, as: 'class' }
      ]
    });
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    res.status(200).json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createEvent = async (req, res) => {
  try {
    // Handle empty string classId - convert to null
    const eventData = { ...req.body };
    if (eventData.classId === '' || eventData.classId === undefined) {
      eventData.classId = null;
    }
    // Remove organizerId if present
    delete eventData.organizerId;
    
    const event = await Event.create(eventData);
    res.status(201).json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    // Handle empty string classId - convert to null
    const eventData = { ...req.body };
    if (eventData.classId === '' || eventData.classId === undefined) {
      eventData.classId = null;
    }
    // Remove organizerId if present
    delete eventData.organizerId;
    
    await event.update(eventData);
    res.status(200).json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    await event.destroy();
    res.status(200).json({ success: true, message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
