import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/store/auth.store';
import type { AuditAction, AuditLog, UserProfile } from '@/types';

const COL = 'auditLogs';
const LOCAL_AUDIT_LOGS_KEY = 'tamraya.auditLogs';
const MAX_AUDIT_LOGS = 100;
const ALLOWED_AUDIT_ACTIONS: AuditAction[] = ['CREATE', 'UPDATE', 'DELETE'];

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

function isAllowedAction(action: AuditAction): boolean {
  return ALLOWED_AUDIT_ACTIONS.includes(action);
}

function trimLocalAuditLogs(): void {
  const trimmed = sortAuditLogs(readLocalAuditLogs().filter((log) => isAllowedAction(log.action))).slice(0, MAX_AUDIT_LOGS);
  writeLocalAuditLogs(trimmed);
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
    if (!isAllowedAction(action)) {
      return;
    }

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

    writeLocalAuditLogs(sortAuditLogs([localLog, ...readLocalAuditLogs()].filter((log) => isAllowedAction(log.action))).slice(0, MAX_AUDIT_LOGS));

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

      await this.trimToLatest();
    } catch {
      // Keep the local fallback so admin pages still show recent activity offline/demo mode.
      trimLocalAuditLogs();
    }
  },

  async trimToLatest(): Promise<void> {
    trimLocalAuditLogs();

    try {
      const snap = await getDocs(query(collection(db, COL), orderBy('timestamp', 'desc')));
      const docs = snap.docs.map((entry) => ({
        id: entry.id,
        action: entry.data().action as AuditAction,
      }));

      const idsToDelete = docs
        .filter((entry, index) => !isAllowedAction(entry.action) || index >= MAX_AUDIT_LOGS)
        .map((entry) => entry.id);

      if (idsToDelete.length === 0) return;

      await Promise.all(idsToDelete.map((id) => deleteDoc(doc(db, COL, id))));
    } catch {
      // Keep local trim as the fallback if Firestore cleanup is unavailable.
    }
  },

  async getLatest(maxRows = MAX_AUDIT_LOGS): Promise<AuditLog[]> {
    try {
      const snap = await getDocs(query(collection(db, COL), orderBy('timestamp', 'desc')));
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

      const filtered = logs.filter((log) => isAllowedAction(log.action)).slice(0, Math.min(maxRows, MAX_AUDIT_LOGS));
      return filtered.length ? filtered : readLocalAuditLogs().filter((log) => isAllowedAction(log.action)).slice(0, Math.min(maxRows, MAX_AUDIT_LOGS));
    } catch {
      return readLocalAuditLogs().filter((log) => isAllowedAction(log.action)).slice(0, Math.min(maxRows, MAX_AUDIT_LOGS));
    }
  },
};
