import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';

async function start() {
  try {
    await connectDB();
    app.listen(env.PORT, () => {
      console.log(`🚀 SR7 Hub API on http://localhost:${env.PORT}/api`);
    });
  } catch (err) {
    console.error('❌ Failed to start:', err);
    process.exit(1);
  }
}

start();

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
  process.exit(1);
});