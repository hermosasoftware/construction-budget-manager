import { getDoc, doc, FirestoreError, onSnapshot } from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { db } from '../config/firebaseConfig';
import { IProjectExtraBudget } from '../types/projectExtraBudget';
import { IService } from '../types/service';
import { toastError } from '../utils/toast';
import {
  changeProjectExtraBudget,
  clearProjectExtraBudget,
} from '../redux/reducers/projectExtraBudgetSlice';
import { store } from '../redux/store';
import { listenersList } from './herperService';

export const listenProjectExtraBudget = ({
  projectId,
  appStrings,
  successCallback,
  errorCallback,
}: { projectId: string } & IService) => {
  try {
    const extraBudgetRef = doc(
      db,
      'projects',
      projectId,
      'projectExtraBudget',
      'summary',
    );
    const { dispatch } = store;

    const unsubscribe = onSnapshot(
      extraBudgetRef,
      doc => {
        const data = {
          ...doc.data(),
          creationDate: doc.data()?.creationDate.toDate().toISOString(),
        } as IProjectExtraBudget;

        dispatch(changeProjectExtraBudget(data));
      },
      error => {
        const index = listenersList.findIndex(
          e => e.name === 'projectExtraBudget',
        );
        if (index !== -1) {
          listenersList.splice(index, 1);
          dispatch(clearProjectExtraBudget());
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

export const getProjectExtraBudget = async ({
  projectId,
  appStrings,
  successCallback,
  errorCallback,
}: { projectId: string } & IService) => {
  try {
    const userRef = doc(
      db,
      'projects',
      projectId,
      'projectExtraBudget',
      'summary',
    );
    const result = await getDoc(userRef);
    const data = {
      ...result.data(),
      creationDate: result.data()?.creationDate.toDate(),
    } as IProjectExtraBudget;

    successCallback && successCallback(data);
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.getInformationError, errorMessage);

    errorCallback && errorCallback();
  }
};
