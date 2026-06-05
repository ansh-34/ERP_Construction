import {
  mediaRepository,
  projectTaskImageRepository,
  projectStageRepository,
  projectTaskRepository,
  type ProjectTaskImageRecord,
  type ProjectTaskRecord,
} from '@repositories/index';
import { transaction } from '@/infra/database/prisma/transaction.js';
import { normalizePrismaError } from '@/utils/prismaError';
import { isNonEmptyString } from '@/utils/validation';

type LocalizedText = string | Record<string, unknown>;

type LocalizedProjectTaskRecord = Omit<
  ProjectTaskRecord,
  'name' | 'assignee'
> & {
  name: LocalizedText;
  assignee: string | null;
};

type TaskSubmissionImageInput = {
  imageId: string;
  description?: string | null;
};

type SubmittedTaskWithImages = LocalizedProjectTaskRecord & {
  images: ProjectTaskImageRecord[];
};

function getLocalizedText(
  value: Record<string, unknown>,
  language: string | null,
): LocalizedText {
  if (!value || typeof value !== 'object') return '';
  if (!language) return value;
  const text = value[language];
  if (typeof text === 'string') return text;
  const fallback = Object.values(value).find((v) => typeof v === 'string');
  return typeof fallback === 'string' ? fallback : '';
}

function getAssigneeUserId(value: unknown): string | null {
  if (!value || typeof value !== 'object') return null;
  const assignee = value as Record<string, unknown>;
  const userId = assignee.userId;
  return typeof userId === 'string' ? userId : null;
}

function normalizeProjectTask(
  task: ProjectTaskRecord,
  language: string | null = null,
): LocalizedProjectTaskRecord {
  return {
    ...task,
    name: getLocalizedText(task.name, language),
    assignee: getAssigneeUserId(task.assignee),
  };
}

function assertImages(images: TaskSubmissionImageInput[]): void {
  for (const image of images) {
    if (!isNonEmptyString(image.imageId)) {
      throw new Error('invalid imageId');
    }

    if (image.description !== undefined && image.description !== null) {
      if (!isNonEmptyString(image.description)) {
        throw new Error('description is required');
      }

      if (/[\r\n]/.test(image.description)) {
        throw new Error('description must be single-line');
      }
    }
  }
}

export const userTaskSubmissionService = {
  submit: async (
    id: string,
    domainId: string,
    userId: string,
    actualEndDate: string,
    taskProgress: number | undefined,
    images: TaskSubmissionImageInput[] = [],
    language: string | null = null,
  ): Promise<SubmittedTaskWithImages> => {
    if (
      !isNonEmptyString(id) ||
      !isNonEmptyString(domainId) ||
      !isNonEmptyString(userId)
    ) {
      throw new Error('invalid ids');
    }

    try {
      const existingTask = await projectTaskRepository.findById(id, domainId);

      if (!existingTask) {
        throw new Error('not found');
      }

      // Verify user is the assignee
      const assigneeId = getAssigneeUserId(existingTask.assignee);
      if (assigneeId !== userId) {
        throw new Error('unauthorized');
      }

      // Validate the submission date is valid ISO format
      const submissionDate = new Date(actualEndDate);
      if (isNaN(submissionDate.getTime())) {
        throw new Error('invalid date');
      }

      if (taskProgress !== undefined && taskProgress > 100) {
        throw new Error('invalid taskProgress');
      }

      assertImages(images);

      // Update task with submission date
      const updatePayload = {
        actualEndDate: submissionDate,
        taskProgress: taskProgress ?? 100,
        taskStatus: 'COMPLETED',
        requiredApproval: true,
      };

      const { updatedTask, createdImages } = await transaction(async (tx) => {
        const updatedTask = await projectTaskRepository.update(
          id,
          domainId,
          updatePayload,
          undefined,
          { transaction: tx },
        );

        if (!updatedTask) {
          throw new Error('not found');
        }

        await projectStageRepository.recalculateProgress(
          updatedTask.stageId,
          domainId,
          undefined,
          { transaction: tx },
        );

        const createdImages = await Promise.all(
          images.map(async (image) => {
            const media = await mediaRepository.findById(
              image.imageId,
              domainId,
              updatedTask.adminId,
            );

            if (!media) {
              throw new Error('image not found');
            }

            return projectTaskImageRepository.create(
              {
                imageId: media.id,
                imageUrl: media.url,
                ...(image.description !== undefined && {
                  description: image.description,
                }),
                taskId: updatedTask.id,
                stageId: updatedTask.stageId,
                projectId: updatedTask.projectId,
                domainId,
                adminId: updatedTask.adminId,
              },
              { transaction: tx },
            );
          }),
        );

        return { updatedTask, createdImages };
      });

      return {
        ...normalizeProjectTask(updatedTask, language),
        images: createdImages,
      };
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },
};
