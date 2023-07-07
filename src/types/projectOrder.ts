export interface IProjectOrder {
  id: string;
  order: number;
  proforma: string;
  date: Date | string;
  activity: string;
  deliverDate: Date | string;
  sentStatus: boolean | string;
  cost: number;
  products: IOrderProduct[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface IOrderProduct {
  id: string;
  quantity: number;
  description: string;
  cost: number;
  tax: number;
  materialRef: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}
