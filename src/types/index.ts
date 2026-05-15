export interface TokenPayload {
  userId: string;
  domainId: string;
  roleId: string | null;
  industry: string;
  adminId?: string;
}
