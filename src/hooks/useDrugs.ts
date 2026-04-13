import { useEffect, useState } from 'react';
import { drugService } from '@/services/drug.service';
import type { Drug, DrugStatus } from '@/types';

export function useDrugs(filters?: { status?: DrugStatus }): {
  drugs: Drug[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
} {
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchDrugs(): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      setDrugs(await drugService.getAll(filters));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการดึงข้อมูลยา');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchDrugs();
  }, [filters?.status]);

  return { drugs, loading, error, refetch: fetchDrugs };
}
