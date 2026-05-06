import nodemailer from 'nodemailer';
import variables from '../config/variables.config.js';

const transporter = nodemailer.createTransport({
  host: variables.SMTP_HOST,
  port: parseInt(variables.SMTP_PORT, 10),
  secure: variables.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: variables.SMTP_USER,
    pass: variables.SMTP_PASS,
  },
});

export const sendMail = async (to: string, subject: string, html: string) => {
  try {
    const info = await transporter.sendMail({
      from: variables.SMTP_FROM,
      to,
      subject,
      html,
    });
    console.log(`[Mail] Message sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`[Mail Error] Failed to send email to ${to}:`, error);
    throw error;
  }
};
