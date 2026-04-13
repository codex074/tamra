import { useEffect, useState } from 'react';
import { doseRuleService } from '@/services/doseRule.service';
import type { DoseRule } from '@/types';

export function useDoseRules(drugId?: string): { rules: DoseRule[]; loading: boolean } {
  const [rules, setRules] = useState<DoseRule[]>([]);
  const isEnabled = Boolean(drugId);

  useEffect(() => {
    if (!isEnabled || !drugId) {
      return;
    }
    void doseRuleService.getByDrugId(drugId).then((data) => {
      setRules(data);
    });
  }, [drugId, isEnabled]);

  return { rules: isEnabled ? rules : [], loading: false };
}
