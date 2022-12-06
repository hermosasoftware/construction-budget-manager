export interface IProjectInvoiceDetail {
  id: string;
  order: number;
  quantity: number;
  name: string;
  date: Date;
  cost: number;
  subtotal: number;
  activity: string;
  invoice: string;
  delivered: number;
  difference: number;
}
