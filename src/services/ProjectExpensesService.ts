import {
  collection,
  addDoc,
  getDocs,
  doc,
  setDoc,
  getDoc,
} from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { db } from '../config/firebaseConfig';
import { IProjectExpense } from '../types/projectExpense';
import { IService } from '../types/service';
import { toastSuccess, toastError } from '../utils/toast';

export const getProjectExpenses = async ({
  projectId,
  appStrings,
  successCallback,
  errorCallback,
}: { projectId: string } & IService): Promise<IProjectExpense[]> => {
  try {
    const userRef = collection(db, 'projects', projectId, 'projectExpenses');
    const result = await getDocs(userRef);
    const data = result.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      date: doc.data().date.toDate(),
    })) as IProjectExpense[];

    successCallback && successCallback();
    return data;
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.getInformationError, errorMessage);

    errorCallback && errorCallback();
    return [];
  }
};

export const getProjectExpenseById = async ({
  projectId,
  projectExpenseId,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  projectExpenseId: string;
} & IService): Promise<IProjectExpense | null> => {
  try {
    const userRef = doc(
      db,
      'projects',
      projectId,
      'projectExpenses',
      projectExpenseId,
    );
    const result = await getDoc(userRef);
    const data = {
      ...result.data(),
      id: result.id,
      date: result.data()?.date.toDate(),
    } as IProjectExpense;

    successCallback && successCallback();
    return data;
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.getInformationError, errorMessage);

    errorCallback && errorCallback();
    return null;
  }
};

export const createProjectExpense = async ({
  projectId,
  projectExpense,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  projectExpense: IProjectExpense;
} & IService): Promise<IProjectExpense | null> => {
  try {
    const { id, ...rest } = projectExpense;
    const userRef = collection(db, 'projects', projectId, 'projectExpenses');
    const result = await addDoc(userRef, rest);
    const data = { ...projectExpense, id: result.id } as IProjectExpense;

    toastSuccess(appStrings.success, appStrings.saveSuccess);

    successCallback && successCallback();
    return data;
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.saveError, errorMessage);

    errorCallback && errorCallback();
    return null;
  }
};

export const updateProjectExpense = async ({
  projectId,
  projectExpense,
  appStrings,
  successCallback,
  errorCallback,
}: { projectId: string; projectExpense: IProjectExpense } & IService) => {
  try {
    const { id, ...rest } = projectExpense;
    const userRef = doc(db, 'projects', projectId, 'projectExpenses', id);
    await setDoc(userRef, rest);

    toastSuccess(appStrings.success, appStrings.saveSuccess);

    successCallback && successCallback();
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.saveError, errorMessage);

    errorCallback && errorCallback();
  }
};
