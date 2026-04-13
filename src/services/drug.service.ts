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
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Drug);
    } catch {
      return mockDrugs.filter((drug) => {
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
