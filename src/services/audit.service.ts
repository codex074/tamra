import type { AuditAction } from '@/types';

export const auditService = {
  async log(
    action: AuditAction,
    collection: string,
    documentId: string,
    oldData?: Record<string, unknown>,
    newData?: Record<string, unknown>,
  ): Promise<void> {
    console.info('audit', { action, collection, documentId, oldData, newData });
  },
};
