import {
  collection,
  getDocs,
  getDoc,
  doc,
  runTransaction,
  writeBatch,
  FirestoreError,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { db } from '../config/firebaseConfig';
import { IBudgetOther } from '../types/budgetOther';
import { IService } from '../types/service';
import { toastSuccess, toastError } from '../utils/toast';
import {
  changeBudgetOthers,
  insertBudgetOther,
  modifyBudgetOther,
  removeBudgetOther,
} from '../redux/reducers/budgetOthersSlice';
import { store } from '../redux/store';
import { listenersList } from './herperService';

export const listenBudgetOthers = ({
  projectId,
  appStrings,
  successCallback,
  errorCallback,
}: { projectId: string } & IService) => {
  try {
    const otherRef = collection(
      db,
      'projects',
      projectId,
      'projectBudget',
      'summary',
      'budgetOthers',
    );
    const budgetOthersQuery = query(otherRef, orderBy('name'));
    const { dispatch, getState } = store;

    const unsubscribe = onSnapshot(
      budgetOthersQuery,
      querySnapshot => {
        let othersList = [...getState().budgetOthers.budgetOthers];

        const budgetOthers: any = querySnapshot
          .docChanges()
          .map(async change => {
            const elem = {
              ...change.doc.data(),
              id: change.doc.id,
              subtotal: change.doc.data().cost * change.doc.data().quantity,
            } as IBudgetOther;

            if (change.type === 'added') {
              return changeTypeAdded(dispatch, othersList, elem);
            }
            if (change.type === 'modified') {
              return changeTypeModified(dispatch, elem);
            }
            if (change.type === 'removed') {
              return changeTypeRemoved(dispatch, elem);
            }
          });

        Promise.all(budgetOthers).then(result => {
          result.flat().length && dispatch(changeBudgetOthers(result));
        });
      },
      error => {
        const index = listenersList.findIndex(e => e.name === 'budgetOthers');
        if (index !== -1) {
          listenersList.splice(index, 1);
          dispatch(changeBudgetOthers([]));
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
  othersList: IBudgetOther[],
  elem: IBudgetOther,
) => {
  if (othersList.length > 0) {
    dispatch(insertBudgetOther(elem));
    return [];
  } else {
    return elem;
  }
};

const changeTypeModified = async (dispatch: any, elem: IBudgetOther) => {
  dispatch(modifyBudgetOther(elem));
  return [];
};

const changeTypeRemoved = async (dispatch: any, elem: IBudgetOther) => {
  dispatch(removeBudgetOther(elem));
  return [];
};

export const getBudgetOthers = async ({
  projectId,
  appStrings,
  successCallback,
  errorCallback,
}: { projectId: string } & IService) => {
  try {
    const OtherRef = collection(
      db,
      'projects',
      projectId,
      'projectBudget',
      'summary',
      'budgetOthers',
    );
    const result = await getDocs(OtherRef);
    const data = result.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      subtotal: doc.data().cost * doc.data().quantity,
    })) as IBudgetOther[];

    successCallback && successCallback(data);
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.getInformationError, errorMessage);

    errorCallback && errorCallback();
  }
};

export const getBudgetOtherById = async ({
  projectId,
  budgetOtherId,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  budgetOtherId: string;
} & IService) => {
  try {
    const OtherRef = doc(
      db,
      'projects',
      projectId,
      'projectBudget',
      'summary',
      'budgetOthers',
      budgetOtherId,
    );
    const result = await getDoc(OtherRef);
    const data = {
      ...result.data(),
      id: result.id,
      subtotal: result.data()?.cost * result.data()?.quantity,
    } as IBudgetOther;

    successCallback && successCallback(data);
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.getInformationError, errorMessage);

    errorCallback && errorCallback();
  }
};

export const createBudgetOther = async ({
  projectId,
  budgetOther,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  budgetOther: IBudgetOther;
} & IService) => {
  try {
    const data = await runTransaction(db, async transaction => {
      const { id, subtotal, ...rest } = budgetOther;
      const budgetRef = collection(db, 'projects', projectId, 'projectBudget');
      const OtherRef = doc(collection(budgetRef, 'summary', 'budgetOthers'));
      const summaryRef = doc(budgetRef, 'summary');
      const summaryDoc = await transaction.get(summaryRef);

      if (!summaryDoc.exists()) {
        throw Error(appStrings.noRecords);
      }

      const summaryTotal = summaryDoc.data().sumOthers + subtotal;

      transaction.update(summaryRef, { sumOthers: summaryTotal });
      transaction.set(OtherRef, rest);

      return {
        ...budgetOther,
        id: OtherRef.id,
      } as IBudgetOther;
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

export const updateBudgetOther = async ({
  projectId,
  budgetOther,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  budgetOther: IBudgetOther;
} & IService) => {
  try {
    await runTransaction(db, async transaction => {
      const { id, subtotal, ...rest } = budgetOther;
      const budgetRef = collection(db, 'projects', projectId, 'projectBudget');
      const OtherRef = doc(budgetRef, 'summary', 'budgetOthers', id);
      const summaryRef = doc(budgetRef, 'summary');
      const OtherDoc = await transaction.get(OtherRef);
      const summaryDoc = await transaction.get(summaryRef);

      if (!OtherDoc.exists() || !summaryDoc.exists()) {
        throw Error(appStrings.noRecords);
      }

      const newSum = subtotal - OtherDoc.data().cost * OtherDoc.data().quantity;
      const summaryTotal = summaryDoc.data().sumOthers + newSum;

      transaction.update(summaryRef, { sumOthers: summaryTotal });
      transaction.set(OtherRef, rest);
    });

    toastSuccess(appStrings.success, appStrings.saveSuccess);

    successCallback && successCallback(budgetOther);
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.saveError, errorMessage);

    errorCallback && errorCallback();
  }
};

export const deleteBudgetOther = async ({
  projectId,
  budgetOtherId,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  budgetOtherId: string;
} & IService) => {
  try {
    const budgetRef = collection(db, 'projects', projectId, 'projectBudget');
    const OtherRef = doc(budgetRef, 'summary', 'budgetOthers', budgetOtherId);
    const summaryRef = doc(budgetRef, 'summary');
    const OtherDoc = await getDoc(OtherRef);
    const summaryDoc = await getDoc(summaryRef);

    if (!OtherDoc.exists() || !summaryDoc.exists()) {
      throw Error(appStrings.noRecords);
    }

    const batch = writeBatch(db);
    const newSum = OtherDoc.data().cost * OtherDoc.data().quantity;
    const summaryTotal = summaryDoc.data().sumOthers - newSum;

    batch.update(summaryRef, { sumOthers: summaryTotal });
    batch.delete(OtherRef);

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
