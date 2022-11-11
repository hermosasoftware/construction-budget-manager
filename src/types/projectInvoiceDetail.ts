export interface IProjectInvoiceDetail {
  id: string;
  order: number;
  quantity: number;
  name: string;
  cost: number;
  subtotal: number;
  activity: string;
  invoice: string;
  delivered: number;
  difference: number;
}
