export interface IProjectInvoiceDetail {
  id: string;
  order: number;
  date: Date;
  activity: string;
  invoice: string;
}

export interface IInvoiceProduct {
  id: string;
  quantity: number;
  description: string;
  cost: number;
}
