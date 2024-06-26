import {
  query,
  where,
  collection,
  getDocs,
  getDoc,
  doc,
  serverTimestamp,
  updateDoc,
  addDoc,
} from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { auth, db } from '../config/firebaseConfig';
import { IUser } from '../types/user';
import { IService } from '../types/service';
import { toastSuccess, toastError } from '../utils/toast';
import {
  createUserWithEmailAndPassword,
  updateCurrentUser,
} from 'firebase/auth';

export const getAllUsers = async ({
  appStrings,
  successCallback,
  errorCallback,
}: IService) => {
  try {
    const userRef = collection(db, 'users');
    const result = await getDocs(userRef);
    const data = result.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
    })) as IUser[];

    successCallback && successCallback(data);
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.getInformationError, errorMessage);

    errorCallback && errorCallback();
  }
};

export const getUserById = async ({
  userId,
  appStrings,
  successCallback,
  errorCallback,
}: { userId: string } & IService) => {
  try {
    const userRef = doc(db, 'users', userId);
    const result = await getDoc(userRef);
    const data = { ...result.data(), id: result.id } as IUser;

    successCallback && successCallback(data);
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.getInformationError, errorMessage);

    errorCallback && errorCallback();
  }
};

export const getUserByUID = async ({
  userUID,
  appStrings,
  successCallback,
  errorCallback,
}: { userUID: string } & IService) => {
  try {
    const userRef = query(collection(db, 'users'), where('uid', '==', userUID));
    const result = await getDocs(userRef);
    const data = result.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      createdAt: doc.data()?.createdAt?.toDate()?.toISOString(),
      updatedAt: doc.data()?.updatedAt?.toDate()?.toISOString(),
    })) as IUser[];

    successCallback && successCallback(data[0]);
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.getInformationError, errorMessage);

    errorCallback && errorCallback();
  }
};

export const getUsersByStatus = async ({
  status,
  appStrings,
  successCallback,
  errorCallback,
}: { status: string } & IService) => {
  try {
    const userRef = query(
      collection(db, 'users'),
      where('status', '==', status),
    );
    const result = await getDocs(userRef);
    const data = result.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
    })) as IUser[];

    successCallback && successCallback(data);
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.getInformationError, errorMessage);

    errorCallback && errorCallback();
  }
};

export const createUser = async ({
  user,
  password,
  appStrings,
  successCallback,
  errorCallback,
}: { user: IUser; password: string } & IService) => {
  try {
    const { id, ...rest } = user;
    let originalUser = auth.currentUser;
    const res = await createUserWithEmailAndPassword(
      auth,
      user.email,
      password,
    );
    await updateCurrentUser(auth, originalUser);
    const result = await addDoc(collection(db, 'users'), {
      ...rest,
      uid: res.user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const data = {
      ...user,
      id: result.id,
    } as IUser;

    toastSuccess(appStrings.success, appStrings.saveSuccess);

    successCallback && successCallback(data);
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.saveError, errorMessage);

    errorCallback && errorCallback();
  }
};

export const updateUser = async ({
  user,
  appStrings,
  successCallback,
  errorCallback,
}: { user: IUser } & IService) => {
  try {
    const { id, createdAt, ...rest } = user;
    const userRef = doc(db, 'users', id);
    await updateDoc(userRef, { ...rest, updatedAt: serverTimestamp() });

    toastSuccess(appStrings.success, appStrings.saveSuccess);

    successCallback && successCallback(user);
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.saveError, errorMessage);

    errorCallback && errorCallback();
  }
};
