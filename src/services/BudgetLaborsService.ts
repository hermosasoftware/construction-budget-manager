import {
  collection,
  getDocs,
  getDoc,
  doc,
  runTransaction,
  writeBatch,
  onSnapshot,
  FirestoreError,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { db } from '../config/firebaseConfig';
import { IBudgetLabor } from '../types/budgetLabor';
import { IService } from '../types/service';
import { toastSuccess, toastError } from '../utils/toast';
import { store } from '../redux/store';
import {
  changeBudgetLabors,
  insertBudgetLabor,
  modifyBudgetLabor,
  removeBudgetLabor,
} from '../redux/reducers/budgetLaborsSlice';
import { listenersList } from './herperService';

export const listenBudgetLabors = ({
  projectId,
  appStrings,
  successCallback,
  errorCallback,
}: { projectId: string } & IService) => {
  try {
    const laborRef = collection(
      db,
      'projects',
      projectId,
      'projectBudget',
      'summary',
      'budgetLabors',
    );
    const budgetLaborsQuery = query(laborRef, orderBy('createdAt'));
    const { dispatch, getState } = store;

    const unsubscribe = onSnapshot(
      budgetLaborsQuery,
      querySnapshot => {
        let laborsList = [...getState().budgetLabors.budgetLabors];

        const budgetLabors: any = querySnapshot
          .docChanges()
          .map(async change => {
            const elem = {
              ...change.doc.data(),
              id: change.doc.id,
              subtotal: change.doc.data().cost * change.doc.data().quantity,
              createdAt: change.doc.data()?.createdAt?.toDate()?.toISOString(),
              updatedAt: change.doc.data()?.updatedAt?.toDate()?.toISOString(),
            } as IBudgetLabor;

            if (change.type === 'added') {
              return changeTypeAdded(dispatch, laborsList, elem);
            }
            if (change.type === 'modified') {
              return changeTypeModified(dispatch, elem);
            }
            if (change.type === 'removed') {
              return changeTypeRemoved(dispatch, elem);
            }
          });

        Promise.all(budgetLabors).then(result => {
          result.flat().length && dispatch(changeBudgetLabors(result));
        });
      },
      error => {
        const index = listenersList.findIndex(e => e.name === 'budgetLabors');
        if (index !== -1) {
          listenersList.splice(index, 1);
          dispatch(changeBudgetLabors([]));
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
  laborsList: IBudgetLabor[],
  elem: IBudgetLabor,
) => {
  if (laborsList.length > 0) {
    dispatch(insertBudgetLabor(elem));
    return [];
  } else {
    return elem;
  }
};

const changeTypeModified = async (dispatch: any, elem: IBudgetLabor) => {
  dispatch(modifyBudgetLabor(elem));
  return [];
};

const changeTypeRemoved = async (dispatch: any, elem: IBudgetLabor) => {
  dispatch(removeBudgetLabor(elem));
  return [];
};

export const getBudgetLabors = async ({
  projectId,
  appStrings,
  successCallback,
  errorCallback,
}: { projectId: string } & IService) => {
  try {
    const laborRef = collection(
      db,
      'projects',
      projectId,
      'projectBudget',
      'summary',
      'budgetLabors',
    );
    const result = await getDocs(laborRef);
    const data = result.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      subtotal: doc.data().cost * doc.data().quantity,
    })) as IBudgetLabor[];

    successCallback && successCallback(data);
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.getInformationError, errorMessage);

    errorCallback && errorCallback();
  }
};

export const getBudgetLaborById = async ({
  projectId,
  budgetLaborId,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  budgetLaborId: string;
} & IService) => {
  try {
    const laborRef = doc(
      db,
      'projects',
      projectId,
      'projectBudget',
      'summary',
      'budgetLabors',
      budgetLaborId,
    );
    const result = await getDoc(laborRef);
    const data = {
      ...result.data(),
      id: result.id,
      subtotal: result.data()?.cost * result.data()?.quantity,
    } as IBudgetLabor;

    successCallback && successCallback(data);
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.getInformationError, errorMessage);

    errorCallback && errorCallback();
  }
};

export const createBudgetLabor = async ({
  projectId,
  budgetLabor,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  budgetLabor: IBudgetLabor;
} & IService) => {
  try {
    const data = await runTransaction(db, async transaction => {
      const { id, subtotal, ...rest } = budgetLabor;
      const budgetRef = collection(db, 'projects', projectId, 'projectBudget');
      const laborRef = doc(collection(budgetRef, 'summary', 'budgetLabors'));
      const summaryRef = doc(budgetRef, 'summary');
      const summaryDoc = await transaction.get(summaryRef);

      if (!summaryDoc.exists()) {
        throw Error(appStrings.noRecords);
      }

      const summaryTotal = summaryDoc.data().sumLabors + subtotal;

      transaction.update(summaryRef, { sumLabors: summaryTotal });
      transaction.set(laborRef, {
        ...rest,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return {
        ...budgetLabor,
        id: laborRef.id,
      } as IBudgetLabor;
    });

    toastSuccess(appStrings.success, appStrings.saveSuccess);

    successCallback && successCallback(data);
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.saveError, errorMessage);

    errorCallback && errorCallback();
  }
};

export const updateBudgetLabor = async ({
  projectId,
  budgetLabor,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  budgetLabor: IBudgetLabor;
} & IService) => {
  try {
    await runTransaction(db, async transaction => {
      const { id, subtotal, ...rest } = budgetLabor;
      const budgetRef = collection(db, 'projects', projectId, 'projectBudget');
      const laborRef = doc(budgetRef, 'summary', 'budgetLabors', id);
      const summaryRef = doc(budgetRef, 'summary');
      const laborDoc = await transaction.get(laborRef);
      const summaryDoc = await transaction.get(summaryRef);

      if (!laborDoc.exists() || !summaryDoc.exists()) {
        throw Error(appStrings.noRecords);
      }

      const newSum = subtotal - laborDoc.data().cost * laborDoc.data().quantity;
      const summaryTotal = summaryDoc.data().sumLabors + newSum;

      transaction.update(summaryRef, { sumLabors: summaryTotal });
      transaction.set(laborRef, { ...rest, updatedAt: serverTimestamp() });
    });

    toastSuccess(appStrings.success, appStrings.saveSuccess);

    successCallback && successCallback(budgetLabor);
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.saveError, errorMessage);

    errorCallback && errorCallback();
  }
};

export const deleteBudgetLabor = async ({
  projectId,
  budgetLaborId,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  budgetLaborId: string;
} & IService) => {
  try {
    const budgetRef = collection(db, 'projects', projectId, 'projectBudget');
    const laborRef = doc(budgetRef, 'summary', 'budgetLabors', budgetLaborId);
    const summaryRef = doc(budgetRef, 'summary');
    const laborDoc = await getDoc(laborRef);
    const summaryDoc = await getDoc(summaryRef);

    if (!laborDoc.exists() || !summaryDoc.exists()) {
      throw Error(appStrings.noRecords);
    }

    const batch = writeBatch(db);
    const newSum = laborDoc.data().cost * laborDoc.data().quantity;
    const summaryTotal = summaryDoc.data().sumLabors - newSum;

    batch.update(summaryRef, { sumLabors: summaryTotal });
    batch.delete(laborRef);

    await batch.commit();

    toastSuccess(appStrings.success, appStrings.deleteSuccess);

    successCallback && successCallback();
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.deleteError, errorMessage);

    errorCallback && errorCallback();
  }
};
