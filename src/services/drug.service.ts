import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { mockDrugs } from '@/lib/mock-data';
import type { Drug, DrugStatus } from '@/types';

const COL = 'drugs';
const LOCAL_DRUGS_KEY = 'tamraya.localDrugs';
const LOCAL_DELETED_IDS_KEY = 'tamraya.deletedDrugIds';

function getDrugKey(drug: Pick<Drug, 'genericName' | 'strength' | 'dosageForm'>): string {
  return `${drug.genericName}|${drug.strength}|${drug.dosageForm}`.toLowerCase();
}

function sortDrugs(drugs: Drug[]): Drug[] {
  return [...drugs].sort((a, b) => a.genericName.localeCompare(b.genericName));
}

function mergeDrugSources(primary: Drug[], secondary: Drug[]): Drug[] {
  const seen = new Set(primary.map(getDrugKey));
  const merged = [...primary];
  for (const drug of secondary) {
    const key = getDrugKey(drug);
    if (!seen.has(key)) {
      merged.push(drug);
      seen.add(key);
    }
  }
  return sortDrugs(merged);
}

function canUseLocalStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readLocalDrugs(): Drug[] {
  if (!canUseLocalStorage()) return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_DRUGS_KEY);
    return raw ? (JSON.parse(raw) as Drug[]) : [];
  } catch {
    return [];
  }
}

function writeLocalDrugs(drugs: Drug[]): void {
  if (!canUseLocalStorage()) return;
  window.localStorage.setItem(LOCAL_DRUGS_KEY, JSON.stringify(drugs));
}

function readDeletedIds(): string[] {
  if (!canUseLocalStorage()) return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_DELETED_IDS_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeDeletedIds(ids: string[]): void {
  if (!canUseLocalStorage()) return;
  window.localStorage.setItem(LOCAL_DELETED_IDS_KEY, JSON.stringify(ids));
}

function upsertLocalDrug(drug: Drug): void {
  const localDrugs = readLocalDrugs();
  const next = localDrugs.filter((item) => item.id !== drug.id);
  next.push(drug);
  writeLocalDrugs(sortDrugs(next));
}

function markDrugDeleted(id: string): void {
  const deletedIds = new Set(readDeletedIds());
  deletedIds.add(id);
  writeDeletedIds([...deletedIds]);
  writeLocalDrugs(readLocalDrugs().filter((drug) => drug.id !== id));
}

function unmarkDrugDeleted(id: string): void {
  const deletedIds = readDeletedIds().filter((item) => item !== id);
  writeDeletedIds(deletedIds);
}

function applyLocalOverrides(drugs: Drug[]): Drug[] {
  const deletedIds = new Set(readDeletedIds());
  const localDrugs = readLocalDrugs();
  const base = drugs.filter((drug) => !deletedIds.has(drug.id));
  return mergeDrugSources(localDrugs, base);
}

function isLocalManagedDrug(id: string): boolean {
  return id.startsWith('excel-') || id.startsWith('local-');
}

let fallbackDrugsPromise: Promise<Drug[]> | null = null;

async function loadFallbackDrugs(): Promise<Drug[]> {
  fallbackDrugsPromise ??= import('@/lib/imported-drugs')
    .then(({ importedDrugs }) => mergeDrugSources(importedDrugs, mockDrugs))
    .catch(() => mockDrugs);
  return applyLocalOverrides(await fallbackDrugsPromise);
}

function filterDrugs(drugs: Drug[], filters?: { status?: DrugStatus; therapeuticClass?: string }): Drug[] {
  return drugs.filter((drug) => {
    const statusMatch = filters?.status ? drug.status === filters.status : true;
    const classMatch = filters?.therapeuticClass ? drug.therapeuticClass === filters.therapeuticClass : true;
    return statusMatch && classMatch;
  });
}

function buildLocalDrug(data: Omit<Drug, 'id' | 'createdAt' | 'updatedAt'>, id?: string): Drug {
  const timestamp = new Date().toISOString();
  return {
    ...data,
    id: id ?? `local-${crypto.randomUUID()}`,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export const drugService = {
  async getAll(filters?: { status?: DrugStatus; therapeuticClass?: string }): Promise<Drug[]> {
    try {
      let q = query(collection(db, COL), orderBy('genericName'));
      if (filters?.status) {
        q = query(q, where('status', '==', filters.status));
      }
      if (filters?.therapeuticClass) {
        q = query(q, where('therapeuticClass', '==', filters.therapeuticClass));
      }
      const snap = await getDocs(q);
      const firestoreDrugs = applyLocalOverrides(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Drug));
      return firestoreDrugs.length ? filterDrugs(firestoreDrugs, filters) : filterDrugs(await loadFallbackDrugs(), filters);
    } catch {
      return filterDrugs(await loadFallbackDrugs(), filters);
    }
  },

  async getById(id: string): Promise<Drug | null> {
    const drugs = await this.getAll();
    return drugs.find((drug) => drug.id === id) ?? null;
  },

  async search(searchQuery: string): Promise<Drug[]> {
    const all = await this.getAll();
    const q = searchQuery.toLowerCase();
    return all.filter((drug) =>
      [drug.genericName, drug.tradeName, drug.therapeuticClass, drug.indication].some((field) =>
        field.toLowerCase().includes(q),
      ),
    );
  },

  async create(data: Omit<Drug, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const ref = await addDoc(collection(db, COL), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return ref.id;
    } catch {
      const drug = buildLocalDrug(data);
      upsertLocalDrug(drug);
      return drug.id;
    }
  },

  async update(id: string, data: Partial<Omit<Drug, 'id' | 'createdAt'>>): Promise<void> {
    const existing = await this.getById(id);
    if (!existing) throw new Error('ไม่พบรายการยาที่ต้องการแก้ไข');

    if (isLocalManagedDrug(id)) {
      upsertLocalDrug({
        ...existing,
        ...data,
        id,
        createdAt: existing.createdAt,
        updatedAt: new Date().toISOString(),
      });
      unmarkDrugDeleted(id);
      return;
    }

    try {
      await updateDoc(doc(db, COL, id), {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } catch {
      upsertLocalDrug({
        ...existing,
        ...data,
        id,
        createdAt: existing.createdAt,
        updatedAt: new Date().toISOString(),
      });
    }
  },

  async remove(id: string): Promise<void> {
    if (isLocalManagedDrug(id)) {
      markDrugDeleted(id);
      return;
    }

    try {
      await deleteDoc(doc(db, COL, id));
    } catch {
      markDrugDeleted(id);
    }
  },
};
