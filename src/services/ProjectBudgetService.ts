import {
  getDoc,
  doc,
  updateDoc,
  onSnapshot,
  FirestoreError,
} from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { db } from '../config/firebaseConfig';
import { IProjectBudget } from '../types/projectBudget';
import { IService } from '../types/service';
import { toastSuccess, toastError } from '../utils/toast';
import { store } from '../redux/store';
import { listenersList } from './herperService';
import {
  changeProjectBudget,
  clearProjectBudget,
} from '../redux/reducers/projectBudgetSlice';

export const listenProjectBudget = ({
  projectId,
  appStrings,
  successCallback,
  errorCallback,
}: { projectId: string } & IService) => {
  try {
    const budgetRef = doc(
      db,
      'projects',
      projectId,
      'projectBudget',
      'summary',
    );
    const { dispatch } = store;

    const unsubscribe = onSnapshot(
      budgetRef,
      doc => {
        const data = {
          ...doc.data(),
          creationDate: doc.data()?.creationDate.toDate().toISOString(),
        } as IProjectBudget;

        dispatch(changeProjectBudget(data));
      },
      error => {
        const index = listenersList.findIndex(e => e.name === 'projectBudget');
        if (index !== -1) {
          listenersList.splice(index, 1);
          dispatch(clearProjectBudget());
        }
        throw error;
      },
    );
    successCallback && successCallback(unsubscribe);
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError || error instanceof FirestoreError) {
      errorMessage = error.message;
    }
    toastError(appStrings.getInformationError, errorMessage);
    errorCallback && errorCallback();
  }
};

export const getProjectBudget = async ({
  projectId,
  appStrings,
  successCallback,
  errorCallback,
}: { projectId: string } & IService) => {
  try {
    const userRef = doc(db, 'projects', projectId, 'projectBudget', 'summary');
    const result = await getDoc(userRef);
    const data = {
      ...result.data(),
      creationDate: result.data()?.creationDate.toDate(),
    } as IProjectBudget;

    successCallback && successCallback(data);
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.getInformationError, errorMessage);

    errorCallback && errorCallback();
  }
};

export const updateProjectBudgetExchange = async ({
  projectId,
  exchange,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  exchange: number;
} & IService) => {
  try {
    const userRef = doc(db, 'projects', projectId, 'projectBudget', 'summary');
    await updateDoc(userRef, { exchange });

    toastSuccess(appStrings.success, appStrings.saveSuccess);

    successCallback && successCallback();
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.saveError, errorMessage);

    errorCallback && errorCallback();
  }
};

export const updateProjectBudgetAdminFee = async ({
  projectId,
  adminFee,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  adminFee: number;
} & IService) => {
  try {
    const userRef = doc(db, 'projects', projectId, 'projectBudget', 'summary');
    await updateDoc(userRef, { adminFee });

    toastSuccess(appStrings.success, appStrings.saveSuccess);

    successCallback && successCallback();
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.saveError, errorMessage);

    errorCallback && errorCallback();
  }
};
