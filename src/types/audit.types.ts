export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW';

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userEmail: string;
  action: AuditAction;
  collection: string;
  documentId: string;
  oldData?: Record<string, unknown>;
  newData?: Record<string, unknown>;
}

export interface AppConfig {
  appName: string;
  hospitalName: string;
  version: string;
  updatedAt: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'pharmacist' | 'viewer';
  isDemo?: boolean;
}
