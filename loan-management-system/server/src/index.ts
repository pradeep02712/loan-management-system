import { app } from './app';
import { connectDB } from './config/db';
import { env } from './config/env';

async function bootstrap() {
  await connectDB();
  app.listen(env.port, () => {
    console.log(`LMS API running at http://localhost:${env.port}/api`);
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start API', error);
  process.exit(1);
});
