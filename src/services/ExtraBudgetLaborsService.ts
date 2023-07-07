import {
  collection,
  getDocs,
  getDoc,
  doc,
  runTransaction,
  writeBatch,
  onSnapshot,
  query,
  FirestoreError,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { db } from '../config/firebaseConfig';
import { IBudgetLabor } from '../types/budgetLabor';
import { IService } from '../types/service';
import { toastSuccess, toastError } from '../utils/toast';
import {
  changeExtraLabors,
  insertExtraLabor,
  modifyExtraLabor,
  removeExtraLabor,
} from '../redux/reducers/extraLaborsSlice';
import { store } from '../redux/store';
import { listenersList } from './herperService';

export const listenExtraLabors = ({
  projectId,
  activityId,
  appStrings,
  successCallback,
  errorCallback,
}: { projectId: string; activityId: string } & IService) => {
  try {
    const laborRef = collection(
      db,
      'projects',
      projectId,
      'projectExtraBudget',
      activityId,
      'budgetLabors',
    );
    const extraLaborsQuery = query(laborRef, orderBy('createdAt'));
    const { dispatch, getState } = store;

    const unsubscribe = onSnapshot(
      extraLaborsQuery,
      querySnapshot => {
        let laborsList = [...getState().extraLabors.extraLabors];

        const extraLabors: any = querySnapshot
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

        Promise.all(extraLabors).then(result => {
          result.flat().length && dispatch(changeExtraLabors(result));
        });
      },
      error => {
        const index = listenersList.findIndex(e => e.name === 'extraLabors');
        if (index !== -1) {
          listenersList.splice(index, 1);
          dispatch(changeExtraLabors([]));
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
    dispatch(insertExtraLabor(elem));
    return [];
  } else {
    return elem;
  }
};

const changeTypeModified = async (dispatch: any, elem: IBudgetLabor) => {
  dispatch(modifyExtraLabor(elem));
  return [];
};

const changeTypeRemoved = async (dispatch: any, elem: IBudgetLabor) => {
  dispatch(removeExtraLabor(elem));
  return [];
};

export const getExtraBudgetLabors = async ({
  projectId,
  activityId,
  appStrings,
  successCallback,
  errorCallback,
}: { projectId: string; activityId: string } & IService) => {
  try {
    const laborRef = query(
      collection(
        db,
        'projects',
        projectId,
        'projectExtraBudget',
        activityId,
        'budgetLabors',
      ),
      orderBy('createdAt'),
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

export const getExtraBudgetLaborById = async ({
  projectId,
  activityId,
  extraBudgetLaborId,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  activityId: string;
  extraBudgetLaborId: string;
} & IService) => {
  try {
    const laborRef = doc(
      db,
      'projects',
      projectId,
      'projectExtraBudget',
      activityId,
      'budgetLabors',
      extraBudgetLaborId,
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

export const createExtraBudgetLabor = async ({
  projectId,
  activityId,
  extraBudgetLabor,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  activityId: string;
  extraBudgetLabor: IBudgetLabor;
} & IService) => {
  try {
    const data = await runTransaction(db, async transaction => {
      const { id, subtotal, ...rest } = extraBudgetLabor;
      const budgetRef = collection(
        db,
        'projects',
        projectId,
        'projectExtraBudget',
      );
      const laborRef = doc(collection(budgetRef, activityId, 'budgetLabors'));
      const summaryRef = doc(budgetRef, 'summary');
      const activityRef = doc(budgetRef, activityId);
      const summaryDoc = await transaction.get(summaryRef);
      const activityDoc = await transaction.get(activityRef);

      if (!summaryDoc.exists() || !activityDoc.exists()) {
        throw Error(appStrings.noRecords);
      }

      const summaryTotal = summaryDoc.data().sumLabors + subtotal;
      const activityTotal = activityDoc.data().sumLabors + subtotal;

      transaction.update(summaryRef, { sumLabors: summaryTotal });
      transaction.update(activityRef, { sumLabors: activityTotal });
      transaction.set(laborRef, {
        ...rest,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return {
        ...extraBudgetLabor,
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

export const updateExtraBudgetLabor = async ({
  projectId,
  activityId,
  extraBudgetLabor,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  activityId: string;
  extraBudgetLabor: IBudgetLabor;
} & IService) => {
  try {
    await runTransaction(db, async transaction => {
      const { id, createdAt, subtotal, ...rest } = extraBudgetLabor;
      const budgetRef = collection(
        db,
        'projects',
        projectId,
        'projectExtraBudget',
      );
      const laborRef = doc(budgetRef, activityId, 'budgetLabors', id);
      const summaryRef = doc(budgetRef, 'summary');
      const activityRef = doc(budgetRef, activityId);
      const laborDoc = await transaction.get(laborRef);
      const summaryDoc = await transaction.get(summaryRef);
      const activityDoc = await transaction.get(activityRef);

      if (!laborDoc.exists() || !summaryDoc.exists() || !activityDoc.exists()) {
        throw Error(appStrings.noRecords);
      }

      const newSum = subtotal - laborDoc.data().cost * laborDoc.data().quantity;
      const summaryTotal = summaryDoc.data().sumLabors + newSum;
      const activityTotal = activityDoc.data().sumLabors + newSum;

      transaction.update(summaryRef, { sumLabors: summaryTotal });
      transaction.update(activityRef, { sumLabors: activityTotal });
      transaction.update(laborRef, { ...rest, updatedAt: serverTimestamp() });
    });

    toastSuccess(appStrings.success, appStrings.saveSuccess);

    successCallback && successCallback(extraBudgetLabor);
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.saveError, errorMessage);

    errorCallback && errorCallback();
  }
};

export const deleteExtraBudgetLabor = async ({
  projectId,
  activityId,
  extraBudgetLaborId,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  activityId: string;
  extraBudgetLaborId: string;
} & IService) => {
  try {
    const budgetRef = collection(
      db,
      'projects',
      projectId,
      'projectExtraBudget',
    );
    const laborRef = doc(
      budgetRef,
      activityId,
      'budgetLabors',
      extraBudgetLaborId,
    );
    const summaryRef = doc(budgetRef, 'summary');
    const activityRef = doc(budgetRef, activityId);
    const laborDoc = await getDoc(laborRef);
    const summaryDoc = await getDoc(summaryRef);
    const activityDoc = await getDoc(activityRef);

    if (!laborDoc.exists() || !summaryDoc.exists() || !activityDoc.exists()) {
      throw Error(appStrings.noRecords);
    }

    const batch = writeBatch(db);
    const newSum = laborDoc.data().cost * laborDoc.data().quantity;
    const summaryTotal = summaryDoc.data().sumLabors - newSum;
    const activityTotal = activityDoc.data().sumLabors - newSum;

    batch.update(summaryRef, { sumLabors: summaryTotal });
    batch.update(activityRef, { sumLabors: activityTotal });
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
