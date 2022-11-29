import {
  collection,
  addDoc,
  getDocs,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
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
}: { projectId: string } & IService) => {
  try {
    const expRef = collection(db, 'projects', projectId, 'projectExpenses');
    const result = await getDocs(expRef);
    const data = result.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      date: doc.data().date.toDate(),
    })) as IProjectExpense[];

    successCallback && successCallback(data);
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.getInformationError, errorMessage);

    errorCallback && errorCallback();
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
} & IService) => {
  try {
    const expRef = doc(
      db,
      'projects',
      projectId,
      'projectExpenses',
      projectExpenseId,
    );
    const result = await getDoc(expRef);
    const data = {
      ...result.data(),
      id: result.id,
      date: result.data()?.date.toDate(),
    } as IProjectExpense;

    successCallback && successCallback(data);
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.getInformationError, errorMessage);

    errorCallback && errorCallback();
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
} & IService) => {
  try {
    const { id, ...rest } = projectExpense;
    const expRef = collection(db, 'projects', projectId, 'projectExpenses');
    const result = await addDoc(expRef, rest);
    const data = { ...projectExpense, id: result.id } as IProjectExpense;

    toastSuccess(appStrings.success, appStrings.saveSuccess);

    successCallback && successCallback(data);
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.saveError, errorMessage);

    errorCallback && errorCallback();
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
    const expRef = doc(db, 'projects', projectId, 'projectExpenses', id);
    await setDoc(expRef, rest);

    toastSuccess(appStrings.success, appStrings.saveSuccess);

    successCallback && successCallback();
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.saveError, errorMessage);

    errorCallback && errorCallback();
  }
};

export const deleteProjectExpense = async ({
  projectId,
  projectExpenseId,
  appStrings,
  successCallback,
  errorCallback,
}: { projectId: string; projectExpenseId: string } & IService) => {
  try {
    const expRef = doc(
      db,
      'projects',
      projectId,
      'projectExpenses',
      projectExpenseId,
    );
    await deleteDoc(expRef);

    toastSuccess(appStrings.success, appStrings.deleteSuccess);

    successCallback && successCallback();
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.deleteError, errorMessage);

    errorCallback && errorCallback();
  }
};
