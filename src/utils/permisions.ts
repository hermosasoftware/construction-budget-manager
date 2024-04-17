import { IUser } from '../types/user';

export const isAdmin = (user: IUser) => user?.role === 'admin';
