import { sequelize } from './config/database.js';

const fixStudentColumns = async () => {
  try {
    console.log('Checking and fixing students table...');
    
    // Check and add missing columns
    const requiredColumns = [
      { name: 'name', type: 'VARCHAR(100)' },
      { name: 'email', type: 'VARCHAR(100)' },
      { name: 'phone', type: 'VARCHAR(20)' },
      { name: 'address', type: 'TEXT' },
      { name: 'bloodGroup', type: 'VARCHAR(5)' }
    ];
    
    for (const col of requiredColumns) {
      const [colResults] = await sequelize.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = '${process.env.DB_NAME}' 
        AND TABLE_NAME = 'students' 
        AND COLUMN_NAME = '${col.name}'
      `);
      
      if (colResults.length === 0) {
        console.log(`Adding "${col.name}" column to students table...`);
        await sequelize.query(`
          ALTER TABLE students 
          ADD COLUMN ${col.name} ${col.type}
        `);
        console.log(`Successfully added "${col.name}" column!`);
      } else {
        console.log(`"${col.name}" column already exists.`);
      }
    }
    
    console.log('All student fixes completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing students table:', error);
    process.exit(1);
  }
};

fixStudentColumns();
