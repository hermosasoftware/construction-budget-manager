import { IMaterialBreakdown } from './collections';

export interface IBudgetActivity {
  id: string;
  activity: string;
  exchange?: number;
  adminFee?: number;
  advance: number;
  sumLabors: number;
  sumMaterials: number;
  sumSubcontracts: number;
  sumOthers: number;
  date: Date;
  materials?: IMaterialBreakdown[];
  createdAt: Date | string;
  updatedAt: Date | string;
}
