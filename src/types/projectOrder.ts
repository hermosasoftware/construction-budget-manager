export interface IProjectOrder {
  id: string;
  order: number;
  proforma: string;
  date: Date;
  activity: string;
  deliverDate: Date;
  sentStatus: boolean | string;
  cost: number;
  products: IOrderProduct[];
}

export interface IOrderProduct {
  id: string;
  quantity: number;
  description: string;
  cost: number;
  materialRef: string;
}
