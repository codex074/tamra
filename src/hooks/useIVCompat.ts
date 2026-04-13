import { useEffect, useState } from 'react';
import { ivCompatService } from '@/services/ivcompat.service';
import type { IVCompatibility, IVSolution } from '@/types';

export function useIVCompat(drugIds: string[], solution: IVSolution): {
  matrix: Record<string, IVCompatibility | null>;
  loading: boolean;
} {
  const [matrix, setMatrix] = useState<Record<string, IVCompatibility | null>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (drugIds.length < 2) {
      setMatrix({});
      return;
    }
    setLoading(true);
    void ivCompatService.getMatrix(drugIds, solution).then((data) => {
      setMatrix(data);
      setLoading(false);
    });
  }, [drugIds, solution]);

  return { matrix, loading };
}
