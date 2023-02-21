import { ISubMaterial } from './collections';

export interface IBudgetMaterial {
  id: string;
  name: string;
  unit: string;
  hasSubMaterials?: boolean;
  quantity: number;
  cost: number;
  subMaterials?: ISubMaterial[];
  subtotal: number;
}
