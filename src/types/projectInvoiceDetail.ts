export interface IProjectInvoiceDetail {
  id: string;
  order: number;
  date: Date | string;
  activity: string;
  invoice: string;
  pdfURL?: string;
  pdfFile?: File;
  products: IInvoiceProduct[];
}

export interface IInvoiceProduct {
  id: string;
  quantity: number;
  tax: number;
  description: string;
  cost: number;
}
