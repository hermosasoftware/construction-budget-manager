import { IBudgetMaterial } from './budgetMaterial';

export interface IMaterial {
  id: string;
  hasSubMaterials?: boolean;
  name: string;
  unit: string;
  cost: number;
  subtotal?: number;
  updatedAt: Date | string;
}

export interface ISubMaterial {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  cost: number;
}

export interface IMaterialBreakdown {
  id: string;
  material: IMaterial | IBudgetMaterial;
  subMaterials: ISubMaterial[];
}
