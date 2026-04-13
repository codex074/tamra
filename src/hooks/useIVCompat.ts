import { useEffect, useState } from 'react';
import { ivCompatService } from '@/services/ivcompat.service';
import type { IVCompatibility, IVSolution } from '@/types';

export function useIVCompat(drugIds: string[], solution: IVSolution): {
  matrix: Record<string, IVCompatibility | null>;
  loading: boolean;
} {
  const [matrix, setMatrix] = useState<Record<string, IVCompatibility | null>>({});
  const hasEnoughDrugs = drugIds.length >= 2;

  useEffect(() => {
    if (!hasEnoughDrugs) {
      return;
    }
    void ivCompatService.getMatrix(drugIds, solution).then((data) => {
      setMatrix(data);
    });
  }, [drugIds, hasEnoughDrugs, solution]);

  return { matrix: hasEnoughDrugs ? matrix : {}, loading: false };
}
