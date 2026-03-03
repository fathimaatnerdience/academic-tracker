import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Op } from 'sequelize';
import User from '../models/User.js';
import PasswordResetToken from '../models/PasswordResetToken.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import Parent from '../models/Parent.js';
import { ErrorResponse } from '../middleware/error.js';
import nodemailer from 'nodemailer';
import { sendEmail } from '../utils/email.js';

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { username, email, password, role, name } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return next(new ErrorResponse('User already exists with this email', 400));
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      role,
      name
    });

    // Note: Teacher/Student/Parent profiles are created separately by admin 
    // through the respective form modals, not during user registration

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      data: {
        user,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return next(new ErrorResponse('Please provide email and password', 400));
    }

    // Check for user
    const user = await User.findOne({ 
      where: { email },
      attributes: { include: ['password'] }
    });

    if (!user) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Check if account is active
    if (!user.isActive) {
      return next(new ErrorResponse('Your account has been deactivated', 401));
    }

    // Update last login
    await user.update({ lastLogin: new Date() });

    // Generate token
    const token = generateToken(user.id);

    // Remove password from response
    user.password = undefined;

    res.status(200).json({
      success: true,
      data: {
        user,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [
        { association: 'studentProfile' },
        { association: 'teacherProfile' },
        { association: 'parentProfile' }
      ]
    });

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
export const updateDetails = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email
    };

    const user = await User.findByPk(req.user.id);
    await user.update(fieldsToUpdate);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
export const updatePassword = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { include: ['password'] }
    });

    // Check current password
    const isMatch = await user.matchPassword(req.body.currentPassword);
    if (!isMatch) {
      return next(new ErrorResponse('Password is incorrect', 401));
    }

    user.password = req.body.newPassword;
    await user.save();

    const token = generateToken(user.id);

    res.status(200).json({
      success: true,
      data: token
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Validate token
// @route   GET /api/auth/validate
// @access  Private
export const validateToken = async (req, res, next) => {
  try {
    // If we reach here, the token is valid (protect middleware verified it)
    res.status(200).json({
      success: true,
      message: 'Token is valid',
      data: {
        user: req.user
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password using token
// @route   POST /api/auth/resetpassword
// @access  Public
export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const record = await PasswordResetToken.findOne({
      where: {
        token: hashedToken,
        expiresAt: { [Op.gt]: new Date() }
      }
    });

    if (!record) {
      return next(new ErrorResponse('Token is invalid or has expired', 400));
    }

    const user = await User.findByPk(record.userId);
    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    user.password = password;
    await user.save();

    // delete the token so it can't be reused
    await record.destroy();

    const authToken = generateToken(user.id);
    res.status(200).json({ success: true, data: authToken });
  } catch (error) {
    next(error);
  }
};

// @desc    Request password reset link
// @route   POST /api/auth/forgotpassword
// @access  Public
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // always respond with generic message to avoid user enumeration
    const user = await User.findOne({ where: { email } });
    if (user) {
      // generate raw token and store hashed version
      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
      const expiresAt = new Date(Date.now() + 3600000); // 1 hour

      await PasswordResetToken.create({
        userId: user.id,
        token: hashedToken,
        expiresAt
      });

      const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
      const message = `You requested a password reset. Click the link below to set a new password.\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.`;

      try {
        const info = await sendEmail({
          to: user.email,
          subject: 'Password Reset Request',
          text: message
        });
        if (process.env.NODE_ENV === 'development') {
          console.log('Reset link:', resetUrl);
          if (info && info.messageId && nodemailer.getTestMessageUrl) {
            // note: nodemailer may not be imported here, so wrap in try
            try {
              console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
            } catch {}
          }
        }
      } catch (err) {
        // log failure but do not expose to user
        console.error('Unable to send reset email', err);
      }
    }

    res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a reset link has been sent.'
    });
  } catch (error) {
    next(error);
  }
};

export default {
  register,
  login,
  getMe,
  updateDetails,
  updatePassword,
  validateToken
};
