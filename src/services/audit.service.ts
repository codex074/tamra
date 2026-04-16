import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/store/auth.store';
import type { AuditAction, AuditLog, UserProfile } from '@/types';

const COL = 'auditLogs';
const LOCAL_AUDIT_LOGS_KEY = 'tamraya.auditLogs';

function canUseLocalStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readLocalAuditLogs(): AuditLog[] {
  if (!canUseLocalStorage()) return [];

  try {
    const raw = window.localStorage.getItem(LOCAL_AUDIT_LOGS_KEY);
    return raw ? (JSON.parse(raw) as AuditLog[]) : [];
  } catch {
    return [];
  }
}

function writeLocalAuditLogs(logs: AuditLog[]): void {
  if (!canUseLocalStorage()) return;
  window.localStorage.setItem(LOCAL_AUDIT_LOGS_KEY, JSON.stringify(logs));
}

function getTimestampValue(value: string): number {
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function sortAuditLogs(logs: AuditLog[]): AuditLog[] {
  return [...logs].sort((a, b) => getTimestampValue(b.timestamp) - getTimestampValue(a.timestamp));
}

function getCurrentUser(): UserProfile | null {
  return useAuthStore.getState().user;
}

function buildActor(user: UserProfile | null): Pick<AuditLog, 'userId' | 'userEmail'> {
  if (user) {
    return {
      userId: user.uid,
      userEmail: user.email,
    };
  }

  return {
    userId: 'anonymous',
    userEmail: 'unknown@tamraya.app',
  };
}

export const auditService = {
  async log(
    action: AuditAction,
    collectionName: string,
    documentId: string,
    oldData?: Record<string, unknown>,
    newData?: Record<string, unknown>,
  ): Promise<void> {
    const actor = buildActor(getCurrentUser());
    const timestamp = new Date().toISOString();

    const localLog: AuditLog = {
      id: `${timestamp}-${documentId}-${action}`,
      timestamp,
      action,
      collection: collectionName,
      documentId,
      oldData,
      newData,
      ...actor,
    };

    writeLocalAuditLogs(sortAuditLogs([localLog, ...readLocalAuditLogs()]).slice(0, 100));

    try {
      await addDoc(collection(db, COL), {
        action,
        collection: collectionName,
        documentId,
        oldData,
        newData,
        ...actor,
        timestamp: serverTimestamp(),
      });
    } catch {
      // Keep the local fallback so admin pages still show recent activity offline/demo mode.
    }
  },

  async getLatest(maxRows = 10): Promise<AuditLog[]> {
    try {
      const snap = await getDocs(query(collection(db, COL), orderBy('timestamp', 'desc'), limit(maxRows)));
      const logs = snap.docs.map((entry) => {
        const data = entry.data();
        const timestampValue =
          typeof data.timestamp?.toDate === 'function'
            ? data.timestamp.toDate().toISOString()
            : new Date().toISOString();

        return {
          id: entry.id,
          timestamp: timestampValue,
          userId: data.userId ?? 'unknown',
          userEmail: data.userEmail ?? 'unknown@tamraya.app',
          action: data.action,
          collection: data.collection,
          documentId: data.documentId,
          oldData: data.oldData,
          newData: data.newData,
        } as AuditLog;
      });

      return logs.length ? logs : readLocalAuditLogs().slice(0, maxRows);
    } catch {
      return readLocalAuditLogs().slice(0, maxRows);
    }
  },
};
