export interface IProjectInvoiceDetail {
  id: string;
  invoice: string;
  order: number;
  date: Date | string;
  activity: string;
  supplier: string;
  pdfURL?: string;
  pdfFile?: File;
  products: IInvoiceProduct[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface IInvoiceProduct {
  id: string;
  quantity: number;
  tax: number;
  description: string;
  cost: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface IXMLFile {
  option: { value: string; label: string };
  activity: string;
  supplier: string;
  xmlFile?: File;
  pdfURL?: string;
  pdfFile?: File;
}
