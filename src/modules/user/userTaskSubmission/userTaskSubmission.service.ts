import {
  projectStageRepository,
  projectTaskRepository,
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

export const userTaskSubmissionService = {
  submit: async (
    id: string,
    domainId: string,
    userId: string,
    actualEndDate: string,
    taskProgress: number | undefined,
    language: string | null = null,
  ): Promise<LocalizedProjectTaskRecord> => {
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

      return normalizeProjectTask(updatedTask, language);
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },
};
