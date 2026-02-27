import dotenv from 'dotenv';
import { sequelize } from './config/database.js';

dotenv.config();

const mustConfirm = process.env.YES_DELETE_ALL_DATA === '1';

const main = async () => {
  const dbName = process.env.DB_NAME;
  const dbHost = process.env.DB_HOST;
  const dbUser = process.env.DB_USER;

  if (!mustConfirm) {
    console.error('Refusing to clear database without explicit confirmation.');
    console.error('Set environment variable YES_DELETE_ALL_DATA=1 to proceed.');
    console.error(`Target DB: ${dbName} on ${dbHost} (user: ${dbUser})`);
    process.exit(1);
  }

  try {
    await sequelize.authenticate();

    const [tables] = await sequelize.query(
      "SELECT table_name AS tableName FROM information_schema.tables WHERE table_schema = DATABASE() AND table_type = 'BASE TABLE'"
    );

    const tableNames = (tables || []).map(t => t.tableName).filter(Boolean);

    console.log(`Clearing ${tableNames.length} tables from DB '${dbName}' on '${dbHost}'...`);

    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

    for (const table of tableNames) {
      await sequelize.query(`TRUNCATE TABLE \`${table}\``);
    }

    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('✅ Database cleared successfully.');
    process.exit(0);
  } catch (err) {
    try {
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    } catch (_) {
      // ignore
    }

    console.error('❌ Failed to clear database:', err);
    process.exit(1);
  }
};

main();
