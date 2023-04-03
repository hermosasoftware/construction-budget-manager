import {
  collection,
  getDocs,
  getDoc,
  doc,
  runTransaction,
  writeBatch,
  FirestoreError,
  onSnapshot,
  orderBy,
  query,
} from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { db } from '../config/firebaseConfig';
import { IBudgetSubcontract } from '../types/budgetSubcontract';
import { IService } from '../types/service';
import { toastSuccess, toastError } from '../utils/toast';
import {
  changeExtraSubcontracts,
  insertExtraSubcontract,
  modifyExtraSubcontract,
  removeExtraSubcontract,
} from '../redux/reducers/extraSubcontractsSlice';
import { store } from '../redux/store';
import { listenersList } from './herperService';

export const listenExtraSubcontracts = ({
  projectId,
  activityId,
  appStrings,
  successCallback,
  errorCallback,
}: { projectId: string; activityId: string } & IService) => {
  try {
    const subCtRef = collection(
      db,
      'projects',
      projectId,
      'projectExtraBudget',
      activityId,
      'budgetSubcontracts',
    );
    const extraSubcontractsQuery = query(subCtRef, orderBy('name'));
    const { dispatch, getState } = store;

    const unsubscribe = onSnapshot(
      extraSubcontractsQuery,
      querySnapshot => {
        let subcontractsList = [
          ...getState().extraSubcontracts.extraSubcontracts,
        ];

        const extraSubcontracts: any = querySnapshot
          .docChanges()
          .map(async change => {
            const elem = {
              ...change.doc.data(),
              id: change.doc.id,
              subtotal: change.doc.data().cost * change.doc.data().quantity,
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

        Promise.all(extraSubcontracts).then(result => {
          result.flat().length && dispatch(changeExtraSubcontracts(result));
        });
      },
      error => {
        const index = listenersList.findIndex(
          e => e.name === 'extraSubcontracts',
        );
        if (index !== -1) {
          listenersList.splice(index, 1);
          dispatch(changeExtraSubcontracts([]));
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
    dispatch(insertExtraSubcontract(elem));
    return [];
  } else {
    return elem;
  }
};

const changeTypeModified = async (dispatch: any, elem: IBudgetSubcontract) => {
  dispatch(modifyExtraSubcontract(elem));
  return [];
};

const changeTypeRemoved = async (dispatch: any, elem: IBudgetSubcontract) => {
  dispatch(removeExtraSubcontract(elem));
  return [];
};

export const getExtraBudgetSubcontracts = async ({
  projectId,
  activityId,
  appStrings,
  successCallback,
  errorCallback,
}: { projectId: string; activityId: string } & IService) => {
  try {
    const subCtRef = collection(
      db,
      'projects',
      projectId,
      'projectExtraBudget',
      activityId,
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

export const getExtraBudgetSubcontractById = async ({
  projectId,
  activityId,
  extraBudgetSubcontractId,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  activityId: string;
  extraBudgetSubcontractId: string;
} & IService) => {
  try {
    const subCtRef = doc(
      db,
      'projects',
      projectId,
      'projectExtraBudget',
      activityId,
      'budgetSubcontracts',
      extraBudgetSubcontractId,
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

export const createExtraBudgetSubcontract = async ({
  projectId,
  activityId,
  extraBudgetSubcontract,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  activityId: string;
  extraBudgetSubcontract: IBudgetSubcontract;
} & IService) => {
  try {
    const data = await runTransaction(db, async transaction => {
      const { id, subtotal, ...rest } = extraBudgetSubcontract;
      const budgetRef = collection(
        db,
        'projects',
        projectId,
        'projectExtraBudget',
      );
      const subCtRef = doc(
        collection(budgetRef, activityId, 'budgetSubcontracts'),
      );
      const summaryRef = doc(budgetRef, 'summary');
      const activityRef = doc(budgetRef, activityId);
      const summaryDoc = await transaction.get(summaryRef);
      const activityDoc = await transaction.get(activityRef);

      if (!summaryDoc.exists() || !activityDoc.exists()) {
        throw Error(appStrings.noRecords);
      }

      const summaryTotal = summaryDoc.data().sumSubcontracts + subtotal;
      const activityTotal = activityDoc.data().sumSubcontracts + subtotal;

      transaction.update(summaryRef, { sumSubcontracts: summaryTotal });
      transaction.update(activityRef, { sumSubcontracts: activityTotal });
      transaction.set(subCtRef, rest);

      return {
        ...extraBudgetSubcontract,
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

export const updateExtraBudgetSubcontract = async ({
  projectId,
  activityId,
  extraBudgetSubcontract,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  activityId: string;
  extraBudgetSubcontract: IBudgetSubcontract;
} & IService) => {
  try {
    await runTransaction(db, async transaction => {
      const { id, subtotal, ...rest } = extraBudgetSubcontract;
      const budgetRef = collection(
        db,
        'projects',
        projectId,
        'projectExtraBudget',
      );
      const subCtRef = doc(budgetRef, activityId, 'budgetSubcontracts', id);
      const summaryRef = doc(budgetRef, 'summary');
      const activityRef = doc(budgetRef, activityId);
      const subCtDoc = await transaction.get(subCtRef);
      const summaryDoc = await transaction.get(summaryRef);
      const activityDoc = await transaction.get(activityRef);

      if (!subCtDoc.exists() || !summaryDoc.exists() || !activityDoc.exists()) {
        throw Error(appStrings.noRecords);
      }

      const newSum = subtotal - subCtDoc.data().cost * subCtDoc.data().quantity;
      const summaryTotal = summaryDoc.data().sumSubcontracts + newSum;
      const activityTotal = activityDoc.data().sumSubcontracts + newSum;

      transaction.update(summaryRef, { sumSubcontracts: summaryTotal });
      transaction.update(activityRef, { sumSubcontracts: activityTotal });
      transaction.set(subCtRef, rest);
    });

    toastSuccess(appStrings.success, appStrings.saveSuccess);

    successCallback && successCallback(extraBudgetSubcontract);
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.saveError, errorMessage);

    errorCallback && errorCallback();
  }
};

export const deleteExtraBudgetSubcontract = async ({
  projectId,
  activityId,
  extraBudgetSubcontractId,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  activityId: string;
  extraBudgetSubcontractId: string;
} & IService) => {
  try {
    const budgetRef = collection(
      db,
      'projects',
      projectId,
      'projectExtraBudget',
    );
    const subCtRef = doc(
      budgetRef,
      activityId,
      'budgetSubcontracts',
      extraBudgetSubcontractId,
    );
    const summaryRef = doc(budgetRef, 'summary');
    const activityRef = doc(budgetRef, activityId);
    const subCtDoc = await getDoc(subCtRef);
    const summaryDoc = await getDoc(summaryRef);
    const activityDoc = await getDoc(activityRef);

    if (!subCtDoc.exists() || !summaryDoc.exists() || !activityDoc.exists()) {
      throw Error(appStrings.noRecords);
    }

    const batch = writeBatch(db);
    const newSum = subCtDoc.data().cost * subCtDoc.data().quantity;
    const summaryTotal = summaryDoc.data().sumSubcontracts - newSum;
    const activityTotal = activityDoc.data().sumSubcontracts - newSum;

    batch.update(summaryRef, { sumSubcontracts: summaryTotal });
    batch.update(activityRef, { sumSubcontracts: activityTotal });
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
