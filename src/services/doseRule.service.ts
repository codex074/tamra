import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { mockDoseRules } from '@/lib/mock-data';
import type { DoseRule } from '@/types';

export const doseRuleService = {
  async getByDrugId(drugId: string): Promise<DoseRule[]> {
    try {
      const snap = await getDocs(query(collection(db, 'doseRules'), where('drugId', '==', drugId)));
      return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as DoseRule);
    } catch {
      return mockDoseRules.filter((rule) => rule.drugId === drugId);
    }
  },

  async getAll(): Promise<DoseRule[]> {
    try {
      const snap = await getDocs(collection(db, 'doseRules'));
      return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as DoseRule);
    } catch {
      return mockDoseRules;
    }
  },
};
