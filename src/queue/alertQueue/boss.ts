import { getBoss } from '../pgBoss';
import { AlertJobs } from './jobs';

export async function getAlertBoss() {
  const boss = await getBoss();
  await Promise.all(
    Object.values(AlertJobs).map((queueName) => boss.createQueue(queueName)),
  );
  return boss;
}
