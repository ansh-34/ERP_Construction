import {
  projectTaskImageRepository,
  projectStageRepository,
  projectTaskRepository,
  type ProjectTaskImageRecord,
  type ProjectTaskRecord,
} from '@repositories/index';
import { normalizePrismaError } from '@/utils/prismaError';
import { isNonEmptyString } from '@/utils/validation';

type LocalizedProjectTaskRecord = Omit<
  ProjectTaskRecord,
  'name' | 'assignee'
> & {
  name: string;
  assignee: string | null;
};

type TaskSubmissionImageInput = {
  imageUrl: string;
  description?: string | null;
};

type SubmittedTaskWithImages = LocalizedProjectTaskRecord & {
  images: ProjectTaskImageRecord[];
};

function getLocalizedText(
  value: Record<string, unknown>,
  language: string | null,
): string {
  if (!value || typeof value !== 'object') return '';
  const lang = language || 'en';
  const text = value[lang];
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
    if (!isNonEmptyString(image.imageUrl)) {
      throw new Error('invalid imageUrl');
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

      const updatedTask = await projectTaskRepository.update(
        id,
        domainId,
        updatePayload,
      );

      if (!updatedTask) {
        throw new Error('not found');
      }

      await projectStageRepository.recalculateProgress(
        updatedTask.stageId,
        domainId,
      );

      const createdImages = await Promise.all(
        images.map((image) =>
          projectTaskImageRepository.create({
            imageUrl: image.imageUrl,
            ...(image.description !== undefined && {
              description: image.description,
            }),
            taskId: updatedTask.id,
            stageId: updatedTask.stageId,
            projectId: updatedTask.projectId,
            domainId,
            adminId: updatedTask.adminId,
          }),
        ),
      );

      return {
        ...normalizeProjectTask(updatedTask, language),
        images: createdImages,
      };
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },
};
