import { IBudgetLabor } from './budgetLabor';
import { IBudgetOther } from './budgetOther';
import { IBudgetSubcontract } from './budgetSubcontract';

export interface IProjectBudget {
  sumLabors: number;
  sumMaterials: number;
  sumSubcontracts: number;
  sumOthers: number;
  exchange: number;
  adminFee: number;
  creationDate: Date;
  labors?: IBudgetLabor[];
  subcontracts?: IBudgetSubcontract[];
  others?: IBudgetOther[];
}
