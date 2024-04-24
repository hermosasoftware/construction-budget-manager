export interface IUser {
  id: string;
  uid: string;
  name: string;
  lastName: string;
  role: string;
  status: boolean | string;
  email: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}
