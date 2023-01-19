export interface IProjectInvoiceDetail {
  id: string;
  order: number;
  completed: boolean;
  date: Date;
  cost: number;
  invoice: string;
}
