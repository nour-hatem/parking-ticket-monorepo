import { AppDataSource } from './data-source.js';

async function run() {
  console.log('Initializing DataSource...');
  await AppDataSource.initialize();
  console.log('Running pending migrations...');
  const migrations = await AppDataSource.runMigrations();
  console.log(`✅ Applied ${migrations.length} migration(s) successfully!`);
  await AppDataSource.destroy();
}

run().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
