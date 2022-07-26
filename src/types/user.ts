export type TIdType = 'national';

export interface IUser {
  name: string;
  lastName: string;
  idType: TIdType;
  id: string;
  email: string;
}
