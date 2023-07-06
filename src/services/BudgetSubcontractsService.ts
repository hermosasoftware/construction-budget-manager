import {
  collection,
  getDocs,
  getDoc,
  doc,
  runTransaction,
  writeBatch,
  query,
  orderBy,
  onSnapshot,
  FirestoreError,
  serverTimestamp,
} from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { db } from '../config/firebaseConfig';
import { IBudgetSubcontract } from '../types/budgetSubcontract';
import { IService } from '../types/service';
import { toastSuccess, toastError } from '../utils/toast';
import { store } from '../redux/store';
import {
  changeBudgetSubcontracts,
  insertBudgetSubcontract,
  modifyBudgetSubcontract,
  removeBudgetSubcontract,
} from '../redux/reducers/budgetSubcontractsSlice';
import { listenersList } from './herperService';

export const listenBudgetSubcontracts = ({
  projectId,
  appStrings,
  successCallback,
  errorCallback,
}: { projectId: string } & IService) => {
  try {
    const subCtRef = collection(
      db,
      'projects',
      projectId,
      'projectBudget',
      'summary',
      'budgetSubcontracts',
    );
    const budgetSubcontractsQuery = query(subCtRef, orderBy('createdAt'));
    const { dispatch, getState } = store;

    const unsubscribe = onSnapshot(
      budgetSubcontractsQuery,
      querySnapshot => {
        let subcontractsList = [
          ...getState().budgetSubcontracts.budgetSubcontracts,
        ];

        const budgetSubcontracts: any = querySnapshot
          .docChanges()
          .map(async change => {
            const elem = {
              ...change.doc.data(),
              id: change.doc.id,
              subtotal: change.doc.data().cost * change.doc.data().quantity,
              createdAt: change.doc.data()?.createdAt?.toDate()?.toISOString(),
              updatedAt: change.doc.data()?.updatedAt?.toDate()?.toISOString(),
            } as IBudgetSubcontract;

            if (change.type === 'added') {
              return changeTypeAdded(dispatch, subcontractsList, elem);
            }
            if (change.type === 'modified') {
              return changeTypeModified(dispatch, elem);
            }
            if (change.type === 'removed') {
              return changeTypeRemoved(dispatch, elem);
            }
          });

        Promise.all(budgetSubcontracts).then(result => {
          result.flat().length && dispatch(changeBudgetSubcontracts(result));
        });
      },
      error => {
        const index = listenersList.findIndex(
          e => e.name === 'budgetSubcontracts',
        );
        if (index !== -1) {
          listenersList.splice(index, 1);
          dispatch(changeBudgetSubcontracts([]));
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
  subcontractsList: IBudgetSubcontract[],
  elem: IBudgetSubcontract,
) => {
  if (subcontractsList.length > 0) {
    dispatch(insertBudgetSubcontract(elem));
    return [];
  } else {
    return elem;
  }
};

const changeTypeModified = async (dispatch: any, elem: IBudgetSubcontract) => {
  dispatch(modifyBudgetSubcontract(elem));
  return [];
};

const changeTypeRemoved = async (dispatch: any, elem: IBudgetSubcontract) => {
  dispatch(removeBudgetSubcontract(elem));
  return [];
};

export const getBudgetSubcontracts = async ({
  projectId,
  appStrings,
  successCallback,
  errorCallback,
}: { projectId: string } & IService) => {
  try {
    const subCtRef = collection(
      db,
      'projects',
      projectId,
      'projectBudget',
      'summary',
      'budgetSubcontracts',
    );
    const result = await getDocs(subCtRef);
    const data = result.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      subtotal: doc.data().cost * doc.data().quantity,
    })) as IBudgetSubcontract[];

    successCallback && successCallback(data);
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.getInformationError, errorMessage);

    errorCallback && errorCallback();
  }
};

export const getBudgetSubcontractById = async ({
  projectId,
  budgetSubcontractId,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  budgetSubcontractId: string;
} & IService) => {
  try {
    const subCtRef = doc(
      db,
      'projects',
      projectId,
      'projectBudget',
      'summary',
      'budgetSubcontracts',
      budgetSubcontractId,
    );
    const result = await getDoc(subCtRef);
    const data = {
      ...result.data(),
      id: result.id,
      subtotal: result.data()?.cost * result.data()?.quantity,
    } as IBudgetSubcontract;

    successCallback && successCallback(data);
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.getInformationError, errorMessage);

    errorCallback && errorCallback();
  }
};

export const createBudgetSubcontract = async ({
  projectId,
  budgetSubcontract,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  budgetSubcontract: IBudgetSubcontract;
} & IService) => {
  try {
    const data = await runTransaction(db, async transaction => {
      const { id, subtotal, ...rest } = budgetSubcontract;
      const budgetRef = collection(db, 'projects', projectId, 'projectBudget');
      const subCtRef = doc(
        collection(budgetRef, 'summary', 'budgetSubcontracts'),
      );
      const summaryRef = doc(budgetRef, 'summary');
      const summaryDoc = await transaction.get(summaryRef);

      if (!summaryDoc.exists()) {
        throw Error(appStrings.noRecords);
      }

      const summaryTotal = summaryDoc.data().sumSubcontracts + subtotal;

      transaction.update(summaryRef, { sumSubcontracts: summaryTotal });
      transaction.set(subCtRef, {
        ...rest,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return {
        ...budgetSubcontract,
        id: subCtRef.id,
      } as IBudgetSubcontract;
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

export const updateBudgetSubcontract = async ({
  projectId,
  budgetSubcontract,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  budgetSubcontract: IBudgetSubcontract;
} & IService) => {
  try {
    await runTransaction(db, async transaction => {
      const { id, subtotal, ...rest } = budgetSubcontract;
      const budgetRef = collection(db, 'projects', projectId, 'projectBudget');
      const subCtRef = doc(budgetRef, 'summary', 'budgetSubcontracts', id);
      const summaryRef = doc(budgetRef, 'summary');
      const subCtDoc = await transaction.get(subCtRef);
      const summaryDoc = await transaction.get(summaryRef);

      if (!subCtDoc.exists() || !summaryDoc.exists()) {
        throw Error(appStrings.noRecords);
      }

      const newSum = subtotal - subCtDoc.data().cost * subCtDoc.data().quantity;
      const summaryTotal = summaryDoc.data().sumSubcontracts + newSum;

      transaction.update(summaryRef, { sumSubcontracts: summaryTotal });
      transaction.set(subCtRef, { ...rest, updatedAt: serverTimestamp() });
    });

    toastSuccess(appStrings.success, appStrings.saveSuccess);

    successCallback && successCallback(budgetSubcontract);
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.saveError, errorMessage);

    errorCallback && errorCallback();
  }
};

export const deleteBudgetSubcontract = async ({
  projectId,
  budgetSubcontractId,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  budgetSubcontractId: string;
} & IService) => {
  try {
    const budgetRef = collection(db, 'projects', projectId, 'projectBudget');
    const subCtRef = doc(
      budgetRef,
      'summary',
      'budgetSubcontracts',
      budgetSubcontractId,
    );
    const summaryRef = doc(budgetRef, 'summary');
    const subCtDoc = await getDoc(subCtRef);
    const summaryDoc = await getDoc(summaryRef);

    if (!subCtDoc.exists() || !summaryDoc.exists()) {
      throw Error(appStrings.noRecords);
    }

    const batch = writeBatch(db);
    const newSum = subCtDoc.data().cost * subCtDoc.data().quantity;
    const summaryTotal = summaryDoc.data().sumSubcontracts - newSum;

    batch.update(summaryRef, { sumSubcontracts: summaryTotal });
    batch.delete(subCtRef);

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
