import { useEffect, useState } from 'react';
import { doseRuleService } from '@/services/doseRule.service';
import type { DoseRule } from '@/types';

export function useDoseRules(drugId?: string): { rules: DoseRule[]; loading: boolean } {
  const [rules, setRules] = useState<DoseRule[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!drugId) {
      setRules([]);
      return;
    }
    setLoading(true);
    void doseRuleService.getByDrugId(drugId).then((data) => {
      setRules(data);
      setLoading(false);
    });
  }, [drugId]);

  return { rules, loading };
}
