import { IBudgetMaterial } from './budgetMaterial';

export interface IMaterial {
  id: string;
  hasSubMaterials?: boolean;
  name: string;
  unit: string;
  cost: number;
  subtotal?: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ISubMaterial {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  cost: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface IMaterialBreakdown {
  id: string;
  material: IMaterial | IBudgetMaterial;
  subMaterials: ISubMaterial[];
}
