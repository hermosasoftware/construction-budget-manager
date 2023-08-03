export interface IProjectExpense {
  id: string;
  docNumber: number;
  name: string;
  owner: string;
  amount: number;
  work: string;
  family: string;
  exchange: number;
  date: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}
