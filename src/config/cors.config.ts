import dotenv from 'dotenv';
dotenv.config();

export const corsConfig = {
  origin: process.env.ALLOWED_ORIGINS!.split(',') || '*',
  methods: process.env.ALLOWED_METHODS!.split(',') || 'GET,POST,PUT,DELETE',
  credentials: true,
};
