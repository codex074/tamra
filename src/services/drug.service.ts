import {
  addDoc,
  collection,
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

function getDrugKey(drug: Pick<Drug, 'genericName' | 'strength' | 'dosageForm'>): string {
  return `${drug.genericName}|${drug.strength}|${drug.dosageForm}`.toLowerCase();
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
  return merged.sort((a, b) => a.genericName.localeCompare(b.genericName));
}

let fallbackDrugsPromise: Promise<Drug[]> | null = null;

async function loadFallbackDrugs(): Promise<Drug[]> {
  fallbackDrugsPromise ??= import('@/lib/imported-drugs')
    .then(({ importedDrugs }) => mergeDrugSources(importedDrugs, mockDrugs))
    .catch(() => mockDrugs);
  return fallbackDrugsPromise;
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
      const firestoreDrugs = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Drug);
      return firestoreDrugs.length ? firestoreDrugs : loadFallbackDrugs();
    } catch {
      const fallbackDrugs = await loadFallbackDrugs();
      return fallbackDrugs.filter((drug) => {
        const statusMatch = filters?.status ? drug.status === filters.status : true;
        const classMatch = filters?.therapeuticClass ? drug.therapeuticClass === filters.therapeuticClass : true;
        return statusMatch && classMatch;
      });
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
    const ref = await addDoc(collection(db, COL), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return ref.id;
  },

  async update(id: string, data: Partial<Omit<Drug, 'id' | 'createdAt'>>): Promise<void> {
    await updateDoc(doc(db, COL, id), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  },

  async softDelete(id: string, updatedBy: string): Promise<void> {
    await updateDoc(doc(db, COL, id), {
      status: 'inactive',
      updatedAt: serverTimestamp(),
      updatedBy,
    });
  },
};
