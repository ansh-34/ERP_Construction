import {
  alertRecipientRepository,
  type CreateNotificationInput,
} from '@repositories/index';

interface RecipientInput {
  domainId: string;
  adminId: string;
  moduleCode: string;
}

export const alertRecipientService = {
  async getRecipients({
    domainId,
    adminId,
    moduleCode,
  }: RecipientInput): Promise<
    Array<Pick<CreateNotificationInput, 'recipientType' | 'recipientId'>>
  > {
    const recipients: Array<
      Pick<CreateNotificationInput, 'recipientType' | 'recipientId'>
    > = [
      { recipientType: 'DOMAIN', recipientId: domainId },
      { recipientType: 'ADMIN', recipientId: adminId },
    ];

    const users = await alertRecipientRepository.findUsersWithModulePermission(
      domainId,
      moduleCode,
      'READ',
    );

    for (const user of users) {
      recipients.push({ recipientType: 'USER', recipientId: user.id });
    }

    return recipients;
  },
};
