import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Parent = sequelize.define('Parent', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  parentId: {
    type: DataTypes.STRING(20),
    allowNull: true
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
  timestamps: true
});

export default Parent;
