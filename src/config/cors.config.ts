import dotenv from 'dotenv';
dotenv.config();

export const corsConfig = {
  origin: process.env.ALLOWED_ORIGINS,
  methods: process.env.ALLOWED_METHODS,
  credentials: true,
};
