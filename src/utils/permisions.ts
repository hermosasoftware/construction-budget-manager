import { IUser } from '../types/user';

export const isAdmin = (user: IUser) => user?.role === 'admin';

export const isManagerOrAdmin = (user: IUser) =>
  user?.role === 'admin' || user?.role === 'manager';
