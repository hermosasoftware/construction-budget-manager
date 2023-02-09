import { IBudgetLabor } from './budgetLabor';
import { IBudgetSubcontract } from './budgetSubcontract';
import { IMaterialBreakdown } from './collections';

export interface IBudgetActivity {
  id: string;
  activity: string;
  sumLabors: number;
  sumMaterials: number;
  sumSubcontracts: number;
  date: Date;
  materials?: IMaterialBreakdown[];
  labors?: IBudgetLabor[];
  subcontracts?: IBudgetSubcontract[];
}
