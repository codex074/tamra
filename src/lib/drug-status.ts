export interface StatusConfig {
  label: string;
  color: string;  // hex
}

export const DRUG_STATUS_CONFIG: Record<string, StatusConfig> = {
  had:          { label: 'High alert drugs (HAD)',                              color: '#0000FF' },
  uc_free:      { label: 'จ่ายฟรีเฉพาะสิทธิ UC',                              color: '#004080' },
  staff_order:  { label: 'Staff สั่งใช้/จ่ายได้ หรือต้องมีใบกำกับ',           color: '#008000' },
  ned_national: { label: 'ยาในบัญชียาหลักแห่งชาติ จ2',                        color: '#008080' },
  all_rights:   { label: 'จ่ายได้ทุกสิทธิ',                                   color: '#1C1C1C' },
  ocpa:         { label: 'OCPA / ยาที่มีมูลค่าสูง',                            color: '#800080' },
  ned_only:     { label: 'NED เฉพาะเบิกได้ (ไม่จ่ายฟรี)',                     color: '#FF0000' },
  restrict_atb: { label: 'Restrict drugs (ATB)',                                color: '#FF00FF' },
  self_pay:     { label: 'ชำระเงินเองทุกสิทธิ',                               color: '#FF8000' },
  self_pay2:    { label: 'ชำระเงินเองทุกสิทธิ (2)',                            color: '#FF8040' },
};

export type DrugStatusKey = keyof typeof DRUG_STATUS_CONFIG;

export function getStatusColor(status: string): string {
  return DRUG_STATUS_CONFIG[status]?.color ?? '#5D6C7B';
}

export function getStatusLabel(status: string): string {
  return DRUG_STATUS_CONFIG[status]?.label ?? status;
}
