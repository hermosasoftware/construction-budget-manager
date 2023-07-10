export interface IBudgetLabor {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  cost: number;
  subtotal: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}
