import { sequelize } from './config/database.js';

const fixParentColumns = async () => {
  try {
    console.log('Checking and fixing parents table...');
    
    // Check and add missing columns
    const requiredColumns = [
      { name: 'name', type: 'VARCHAR(100)' },
      { name: 'email', type: 'VARCHAR(100)' },
      { name: 'phone', type: 'VARCHAR(20)' },
      { name: 'address', type: 'TEXT' },
      { name: 'password', type: 'VARCHAR(255)' },
      { name: 'occupation', type: 'VARCHAR(100)' },
      { name: 'relationship', type: 'ENUM("father", "mother", "guardian", "other")' },
      { name: 'workPhone', type: 'VARCHAR(20)' },
      { name: 'workAddress', type: 'TEXT' }
    ];
    
    for (const col of requiredColumns) {
      const [colResults] = await sequelize.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = '${process.env.DB_NAME}' 
        AND TABLE_NAME = 'parents' 
        AND COLUMN_NAME = '${col.name}'
      `);
      
      if (colResults.length === 0) {
        console.log(`Adding "${col.name}" column to parents table...`);
        await sequelize.query(`
          ALTER TABLE parents 
          ADD COLUMN ${col.name} ${col.type}
        `);
        console.log(`Successfully added "${col.name}" column!`);
      } else {
        console.log(`"${col.name}" column already exists.`);
      }
    }
    
    console.log('All parent fixes completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing parents table:', error);
    process.exit(1);
  }
};

fixParentColumns();
