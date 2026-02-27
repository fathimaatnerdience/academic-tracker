import { sequelize } from './config/database.js';

const fixTeacherNameColumn = async () => {
  try {
    console.log('Checking and fixing teachers table...');
    
    // Check if the name column exists
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = '${process.env.DB_NAME}' 
      AND TABLE_NAME = 'teachers' 
      AND COLUMN_NAME = 'name'
    `);
    
    if (results.length === 0) {
      console.log('Adding "name" column to teachers table...');
      await sequelize.query(`
        ALTER TABLE teachers 
        ADD COLUMN name VARCHAR(100) AFTER userId
      `);
      console.log('Successfully added "name" column to teachers table!');
    } else {
      console.log('"name" column already exists in teachers table.');
    }
    
    // Also check and add other fields that might be missing
    const requiredColumns = [
      { name: 'email', type: 'VARCHAR(100)' },
      { name: 'phone', type: 'VARCHAR(20)' },
      { name: 'address', type: 'TEXT' },
      { name: 'bloodGroup', type: 'VARCHAR(5)' },
      { name: 'emergencyContact', type: 'VARCHAR(20)' }
    ];
    
    for (const col of requiredColumns) {
      const [colResults] = await sequelize.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = '${process.env.DB_NAME}' 
        AND TABLE_NAME = 'teachers' 
        AND COLUMN_NAME = '${col.name}'
      `);
      
      if (colResults.length === 0) {
        console.log(`Adding "${col.name}" column to teachers table...`);
        await sequelize.query(`
          ALTER TABLE teachers 
          ADD COLUMN ${col.name} ${col.type}
        `);
        console.log(`Successfully added "${col.name}" column!`);
      } else {
        console.log(`"${col.name}" column already exists.`);
      }
    }
    
    console.log('All fixes completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing teachers table:', error);
    process.exit(1);
  }
};

fixTeacherNameColumn();
