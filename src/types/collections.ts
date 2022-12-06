import { IBudgetMaterial } from './budgetMaterial';

export interface IMaterial {
  id: string;
  hasSubMaterials?: boolean;
  name: string;
  unit: string;
  cost: number;
}

export interface ISubMaterial {
  id: string;
  name: string;
  unit: string;
  quantity: string;
  cost: number;
}

export interface IMaterialBreakdown {
  id: string;
  material: IMaterial | IBudgetMaterial;
  subMaterials: ISubMaterial[];
}
