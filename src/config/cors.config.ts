import dotenv from 'dotenv';
dotenv.config();

export const corsConfig = {
  origin: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim())
    : [],
  methods: process.env.ALLOWED_METHODS,
  credentials: true,
};
