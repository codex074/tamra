import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { mockCompat } from '@/lib/mock-data';
import type { IVCompatibility, IVSolution } from '@/types';

function matchesSolution(record: IVCompatibility, solution: IVSolution): boolean {
  return record.solution === solution || record.solution === 'any' || solution === 'any';
}

function pairKey(left: string, right: string): string {
  return [left, right].sort().join('-');
}

export const ivCompatService = {
  async checkPair(drugAId: string, drugBId: string, solution: IVSolution): Promise<IVCompatibility | null> {
    try {
      const col = collection(db, 'ivCompatibility');
      const q1 = query(col, where('drugAId', '==', drugAId), where('drugBId', '==', drugBId));
      const q2 = query(col, where('drugAId', '==', drugBId), where('drugBId', '==', drugAId));
      const [s1, s2] = await Promise.all([getDocs(q1), getDocs(q2)]);
      const match = [...s1.docs, ...s2.docs].find((doc) => matchesSolution(doc.data() as IVCompatibility, solution));
      return match ? ({ id: match.id, ...match.data() } as IVCompatibility) : null;
    } catch {
      return (
        mockCompat.find(
          (item) =>
            ((item.drugAId === drugAId && item.drugBId === drugBId) ||
              (item.drugAId === drugBId && item.drugBId === drugAId)) &&
            matchesSolution(item, solution),
        ) ?? null
      );
    }
  },

  async getMatrix(drugIds: string[], solution: IVSolution): Promise<Record<string, IVCompatibility | null>> {
    const pairs: Array<[string, string]> = [];
    for (let index = 0; index < drugIds.length; index += 1) {
      for (let inner = index + 1; inner < drugIds.length; inner += 1) {
        pairs.push([drugIds[index], drugIds[inner]]);
      }
    }
    const entries = await Promise.all(
      pairs.map(async ([left, right]) => [pairKey(left, right), await this.checkPair(left, right, solution)] as const),
    );
    return Object.fromEntries(entries);
  },
};
