export interface IProjectOrder {
  id: string;
  order: number;
  proforma: string;
  date: Date;
  cost: number;
  imp: number;
  subtotal: number;
  total: number;
  products: IOrderProduct[];
}

export interface IOrderProduct {
  id: string;
  quantity: string;
  description: string;
  activity: string;
  cost: number;
  imp: number;
  subtotal: number;
  total: number;
}
