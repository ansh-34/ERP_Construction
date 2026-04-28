import dotenv from 'dotenv';
dotenv.config();

export const corsConfig = {
  allowedOrigins: process.env.ALLOWED_ORIGINS.split(','),
  methods: process.env.ALLOWED_METHODS.split(','),
  credentials: true,
};
