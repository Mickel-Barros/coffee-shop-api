import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

import dotenv from 'dotenv';
dotenv.config({ path: '.env.development' });

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
  },
});
