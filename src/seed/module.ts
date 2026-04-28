import { modules } from '@constants/index';
import prisma from '@/infra/database/prisma/prisma.client';

export const moduleData = async () => {
  try {
    const modulesData = [];

    for (const module of modules) {
      const existingModule = await prisma.module.findFirst({
        where: {
          isDeleted: false,
          code: module.code,
        },
      });
      if (!existingModule) {
        modulesData.push({
          name: module.name,
          code: module.code,
          
        });
      }
    }

    if (modulesData.length > 0) {
      await prisma.module.createMany({
        data: modulesData,
      });
    }
  } catch (error) {
    console.log('error', error);
  }
};
