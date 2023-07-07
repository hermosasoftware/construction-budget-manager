export interface IProject {
  id: string;
  name: string;
  client: string;
  location: string;
  status: string;
  budgetOpen: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}
