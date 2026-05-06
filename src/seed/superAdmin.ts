import bcrypt from 'bcryptjs';
import variables from '../config/variables.config.js';
import prisma from '../infra/database/prisma/prisma.client.js';

// Checking for superAdmins
export const initSuperAdmin = async () => {
  const superAdminCount = await prisma.superAdmin.count();

  if (superAdminCount === 0) {
    console.log(
      'No SuperAdmin found. Creating one from environment variables...',
    );

    const email = variables.SUPERADMIN_EMAIL;
    const password = variables.SUPERADMIN_PASSWORD;
    const nameString = variables.SUPERADMIN_NAME;

    if (!email || !password) {
      throw new Error(
        'Cannot start server: No SuperAdmin exists, and SUPERADMIN_EMAIL/SUPER_ADMIN_EMAIL or SUPERADMIN_PASSWORD/SUPER_ADMIN_PASSWORD is not set in the environment.',
      );
    }

    let nameObj = { en: 'Super Admin' };
    if (nameString) {
      try {
        nameObj = JSON.parse(nameString);
      } catch {
        nameObj = { en: nameString };
      }
    }

    const saltRounds = Number(variables.SALT_ROUNDS || 10);
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    await prisma.superAdmin.create({
      data: {
        email,
        password: hashedPassword,
        name: nameObj,
        status: 'active',
      },
    });

    console.log('SuperAdmin created successfully.');
  } else {
    console.log('SuperAdmin already exists.');
  }
};
