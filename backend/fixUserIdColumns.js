import { sequelize } from './config/database.js';

const fixUserIdColumns = async () => {
  try {
    console.log('Altering userId columns to allow null (MariaDB)...');
    
    // Get all FK constraints for students table
    const [studentFKs] = await sequelize.query(
      `SELECT CONSTRAINT_NAME FROM information_schema.TABLE_CONSTRAINTS 
       WHERE TABLE_NAME = 'students' AND CONSTRAINT_TYPE = 'FOREIGN KEY'`
    );
    console.log('Student FKs:', studentFKs);
    
    // Drop all FKs for students
    for (const fk of studentFKs) {
      await sequelize.query(`ALTER TABLE students DROP FOREIGN KEY ${fk.CONSTRAINT_NAME}`);
    }
    // Modify column
    await sequelize.query(`ALTER TABLE students MODIFY COLUMN userId VARCHAR(36) NULL`);
    console.log('✓ Fixed students.userId');
    
    // Get all FK constraints for teachers table
    const [teacherFKs] = await sequelize.query(
      `SELECT CONSTRAINT_NAME FROM information_schema.TABLE_CONSTRAINTS 
       WHERE TABLE_NAME = 'teachers' AND CONSTRAINT_TYPE = 'FOREIGN KEY'`
    );
    console.log('Teacher FKs:', teacherFKs);
    
    // Drop all FKs for teachers
    for (const fk of teacherFKs) {
      await sequelize.query(`ALTER TABLE teachers DROP FOREIGN KEY ${fk.CONSTRAINT_NAME}`);
    }
    // Modify column
    await sequelize.query(`ALTER TABLE teachers MODIFY COLUMN userId VARCHAR(36) NULL`);
    console.log('✓ Fixed teachers.userId');
    
    // Get all FK constraints for parents table
    const [parentFKs] = await sequelize.query(
      `SELECT CONSTRAINT_NAME FROM information_schema.TABLE_CONSTRAINTS 
       WHERE TABLE_NAME = 'parents' AND CONSTRAINT_TYPE = 'FOREIGN KEY'`
    );
    console.log('Parent FKs:', parentFKs);
    
    // Drop all FKs for parents
    for (const fk of parentFKs) {
      await sequelize.query(`ALTER TABLE parents DROP FOREIGN KEY ${fk.CONSTRAINT_NAME}`);
    }
    // Modify column
    await sequelize.query(`ALTER TABLE parents MODIFY COLUMN userId VARCHAR(36) NULL`);
    console.log('✓ Fixed parents.userId');
    
    console.log('\nAll userId columns fixed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing columns:', error);
    process.exit(1);
  }
};

fixUserIdColumns();
