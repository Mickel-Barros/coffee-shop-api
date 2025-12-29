// prisma.config.ts
import 'dotenv/config'; // Import padrão
import { defineConfig, env } from 'prisma/config';

// Carrega .env específico, por exemplo .env.production
import dotenv from 'dotenv';
dotenv.config({ path: '.env.development' }); // ou '.env.example'

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
  },
});
