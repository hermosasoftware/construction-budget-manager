import { IUser } from '../types/user';

// The logic here is a temporary dummy logic that works with the local storage
// just to give the login and signup functionality for the sake of demonstrations.
// In theory, implementing a real functionality with Back-End endpoints
// will be just a matter of changing code in this file

const tmpReadUsers = () => {
  const usersJson = localStorage.getItem('users');
  return usersJson ? JSON.parse(usersJson) : {};
};

const tmpReadUser = (key: string): (IUser & { password?: string }) | null =>
  tmpReadUsers()?.[key];

export const signUp = async (
  data: IUser & { password: string; passwordVerification?: string },
): Promise<IUser | null> => {
  delete data.passwordVerification;
  const users = tmpReadUsers();
  users[data.id] = data;
  users[data.email] = data;
  localStorage.setItem('users', JSON.stringify(users));
  return data;
};

export const logIn = async (
  key?: string,
  password?: string,
): Promise<[string | null, IUser | null]> => {
  if (!key) return [null, null];
  const user = tmpReadUser(key);
  if (!user)
    return [
      'No existe ninguna cuenta con el identificador proporcionado',
      null,
    ];
  if (user.password !== password) return ['La contraseña es incorrecta', null];
  delete user.password;
  return [null, user];
};

/**
 * Cheks if the Key (ID/Email) exists
 */
export const validateKey = async (key?: string): Promise<boolean> => {
  if (!key) return false;
  const user = tmpReadUser(key);
  return !user;
};
