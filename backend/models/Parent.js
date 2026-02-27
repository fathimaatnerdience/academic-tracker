import { DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';
import { sequelize } from '../config/database.js';

const Parent = sequelize.define('Parent', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  parentId: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  // Direct fields for admin-created parents (not linked to User table)
  name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [6, 100]
    }
  },
  occupation: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  relationship: {
    type: DataTypes.ENUM('father', 'mother', 'guardian', 'other'),
    allowNull: false,
    defaultValue: 'father'
  },
  workPhone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  workAddress: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'parents',
  timestamps: true,
  hooks: {
    beforeCreate: async (parent) => {
      if (parent.password) {
        const salt = await bcrypt.genSalt(10);
        parent.password = await bcrypt.hash(parent.password, salt);
      }
    },
    beforeUpdate: async (parent) => {
      if (parent.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        parent.password = await bcrypt.hash(parent.password, salt);
      }
    }
  }
});

// Instance method to check password
Parent.prototype.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default Parent;
