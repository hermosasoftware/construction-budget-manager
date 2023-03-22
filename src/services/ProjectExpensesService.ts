import {
  collection,
  addDoc,
  getDocs,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  FirestoreError,
} from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { db } from '../config/firebaseConfig';
import { IProjectExpense } from '../types/projectExpense';
import { IService } from '../types/service';
import { toastSuccess, toastError } from '../utils/toast';
import {
  changeProjectExpenses,
  insertProjectExpense,
  modifyProjectExpense,
  removeProjectExpense,
} from '../redux/reducers/projectExpensesSlice';
import { store } from '../redux/store';
import { listenersList } from './herperService';

export const listenProjectExpenses = ({
  projectId,
  appStrings,
  successCallback,
  errorCallback,
}: { projectId: string } & IService) => {
  try {
    const expRef = collection(db, 'projects', projectId, 'projectExpenses');
    const projectExpensesQuery = query(expRef, orderBy('date'));
    const { dispatch, getState } = store;

    const unsubscribe = onSnapshot(
      projectExpensesQuery,
      querySnapshot => {
        let expensesList = [...getState().projectExpenses.projectExpenses];

        const projectExpenses: any = querySnapshot
          .docChanges()
          .map(async change => {
            const elem = {
              ...change.doc.data(),
              id: change.doc.id,
              date: change.doc.data().date.toDate().toISOString(),
            } as IProjectExpense;

            if (change.type === 'added') {
              return changeTypeAdded(dispatch, expensesList, elem);
            }
            if (change.type === 'modified') {
              return changeTypeModified(dispatch, elem);
            }
            if (change.type === 'removed') {
              return changeTypeRemoved(dispatch, elem);
            }
          });

        Promise.all(projectExpenses).then(result => {
          result.flat().length && dispatch(changeProjectExpenses(result));
        });
      },
      error => {
        const index = listenersList.findIndex(
          e => e.name === 'projectExpenses',
        );
        if (index !== -1) {
          listenersList.splice(index, 1);
          dispatch(changeProjectExpenses([]));
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

const changeTypeAdded = async (
  dispatch: any,
  expensesList: IProjectExpense[],
  elem: IProjectExpense,
) => {
  if (expensesList.length > 0) {
    dispatch(insertProjectExpense(elem));
    return [];
  } else {
    return elem;
  }
};

const changeTypeModified = async (dispatch: any, elem: IProjectExpense) => {
  dispatch(modifyProjectExpense(elem));
  return [];
};

const changeTypeRemoved = async (dispatch: any, elem: IProjectExpense) => {
  dispatch(removeProjectExpense(elem));
  return [];
};

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

    successCallback && successCallback(projectExpense);
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
