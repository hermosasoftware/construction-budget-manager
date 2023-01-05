export interface IProjectOrder {
  id: string;
  order: number;
  proforma: string;
  date: Date;
  cost: number;
  products: IOrderProduct[];
}

export interface IOrderProduct {
  id: string;
  quantity: number;
  description: string;
  activity: string;
  cost: number;
  materialRef: string;
}
