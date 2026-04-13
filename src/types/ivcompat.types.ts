export type IVSolution = 'NSS' | 'D5W' | 'D5NSS' | 'D5S3' | 'LRS' | 'sterile_water' | 'any';
export type CompatResult = 'Y' | 'N' | 'Conditional' | 'Unknown';
export type StorageTemp = 'room_temp' | 'refrigerated' | 'protected_light';

export interface IVCompatibility {
  id: string;
  drugAId: string;
  drugBId: string;
  solution: IVSolution;
  compatible: CompatResult;
  concentrationA?: string;
  concentrationB?: string;
  timeLimitHr?: number;
  temperature?: StorageTemp;
  notes?: string;
  reference?: string;
  verifiedDate?: string;
  createdAt: string;
  updatedAt: string;
}
