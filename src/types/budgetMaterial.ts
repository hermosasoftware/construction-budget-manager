export interface IBudgetMaterial {
  id: string;
  name: string;
  unit: string;
  hasSubMaterials?: boolean;
  quantity: number;
  cost: number;
  subtotal: number;
}
