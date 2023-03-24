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
import { IBudgetOther } from '../types/budgetOther';
import { IService } from '../types/service';
import { toastSuccess, toastError } from '../utils/toast';
import {
  changeExtraOthers,
  insertExtraOther,
  modifyExtraOther,
  removeExtraOther,
} from '../redux/reducers/extraOthersSlice';
import { store } from '../redux/store';
import { listenersList } from './herperService';

export const listenExtraOthers = ({
  projectId,
  activityId,
  appStrings,
  successCallback,
  errorCallback,
}: { projectId: string; activityId: string } & IService) => {
  try {
    const otherRef = collection(
      db,
      'projects',
      projectId,
      'projectExtraBudget',
      activityId,
      'budgetOthers',
    );
    const extraOthersQuery = query(otherRef, orderBy('name'));
    const { dispatch, getState } = store;

    const unsubscribe = onSnapshot(
      extraOthersQuery,
      querySnapshot => {
        let othersList = [...getState().extraOthers.extraOthers];

        const extraOthers: any = querySnapshot
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

        Promise.all(extraOthers).then(result => {
          result.flat().length && dispatch(changeExtraOthers(result));
        });
      },
      error => {
        const index = listenersList.findIndex(e => e.name === 'extraOthers');
        if (index !== -1) {
          listenersList.splice(index, 1);
          dispatch(changeExtraOthers([]));
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
    dispatch(insertExtraOther(elem));
    return [];
  } else {
    return elem;
  }
};

const changeTypeModified = async (dispatch: any, elem: IBudgetOther) => {
  dispatch(modifyExtraOther(elem));
  return [];
};

const changeTypeRemoved = async (dispatch: any, elem: IBudgetOther) => {
  dispatch(removeExtraOther(elem));
  return [];
};

export const getExtraBudgetOthers = async ({
  projectId,
  activityId,
  appStrings,
  successCallback,
  errorCallback,
}: { projectId: string; activityId: string } & IService) => {
  try {
    const OtherRef = collection(
      db,
      'projects',
      projectId,
      'projectExtraBudget',
      activityId,
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

export const getExtraBudgetOtherById = async ({
  projectId,
  activityId,
  extraBudgetOtherId,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  activityId: string;
  extraBudgetOtherId: string;
} & IService) => {
  try {
    const OtherRef = doc(
      db,
      'projects',
      projectId,
      'projectExtraBudget',
      activityId,
      'budgetOthers',
      extraBudgetOtherId,
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

export const createExtraBudgetOther = async ({
  projectId,
  activityId,
  extraBudgetOther,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  activityId: string;
  extraBudgetOther: IBudgetOther;
} & IService) => {
  try {
    const data = await runTransaction(db, async transaction => {
      const { id, subtotal, ...rest } = extraBudgetOther;
      const budgetRef = collection(
        db,
        'projects',
        projectId,
        'projectExtraBudget',
      );
      const OtherRef = doc(collection(budgetRef, activityId, 'budgetOthers'));
      const summaryRef = doc(budgetRef, 'summary');
      const activityRef = doc(budgetRef, activityId);
      const summaryDoc = await transaction.get(summaryRef);
      const activityDoc = await transaction.get(activityRef);

      if (!summaryDoc.exists() || !activityDoc.exists()) {
        throw Error(appStrings.noRecords);
      }

      const summaryTotal = summaryDoc.data().sumOthers + subtotal;
      const activityTotal = activityDoc.data().sumOthers + subtotal;

      transaction.update(summaryRef, { sumOthers: summaryTotal });
      transaction.update(activityRef, { sumOthers: activityTotal });
      transaction.set(OtherRef, rest);

      return {
        ...extraBudgetOther,
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

export const updateExtraBudgetOther = async ({
  projectId,
  activityId,
  extraBudgetOther,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  activityId: string;
  extraBudgetOther: IBudgetOther;
} & IService) => {
  try {
    await runTransaction(db, async transaction => {
      const { id, subtotal, ...rest } = extraBudgetOther;
      const budgetRef = collection(
        db,
        'projects',
        projectId,
        'projectExtraBudget',
      );
      const OtherRef = doc(budgetRef, activityId, 'budgetOthers', id);
      const summaryRef = doc(budgetRef, 'summary');
      const activityRef = doc(budgetRef, activityId);
      const OtherDoc = await transaction.get(OtherRef);
      const summaryDoc = await transaction.get(summaryRef);
      const activityDoc = await transaction.get(activityRef);

      if (!OtherDoc.exists() || !summaryDoc.exists() || !activityDoc.exists()) {
        throw Error(appStrings.noRecords);
      }

      const newSum = subtotal - OtherDoc.data().cost * OtherDoc.data().quantity;
      const summaryTotal = summaryDoc.data().sumOthers + newSum;
      const activityTotal = activityDoc.data().sumOthers + newSum;

      transaction.update(summaryRef, { sumOthers: summaryTotal });
      transaction.update(activityRef, { sumOthers: activityTotal });
      transaction.set(OtherRef, rest);
    });

    toastSuccess(appStrings.success, appStrings.saveSuccess);

    successCallback && successCallback(extraBudgetOther);
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.saveError, errorMessage);

    errorCallback && errorCallback();
  }
};

export const deleteExtraBudgetOther = async ({
  projectId,
  activityId,
  extraBudgetOtherId,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  activityId: string;
  extraBudgetOtherId: string;
} & IService) => {
  try {
    const budgetRef = collection(
      db,
      'projects',
      projectId,
      'projectExtraBudget',
    );
    const OtherRef = doc(
      budgetRef,
      activityId,
      'budgetOthers',
      extraBudgetOtherId,
    );
    const summaryRef = doc(budgetRef, 'summary');
    const activityRef = doc(budgetRef, activityId);
    const OtherDoc = await getDoc(OtherRef);
    const summaryDoc = await getDoc(summaryRef);
    const activityDoc = await getDoc(activityRef);

    if (!OtherDoc.exists() || !summaryDoc.exists() || !activityDoc.exists()) {
      throw Error(appStrings.noRecords);
    }

    const batch = writeBatch(db);
    const newSum = OtherDoc.data().cost * OtherDoc.data().quantity;
    const summaryTotal = summaryDoc.data().sumOthers - newSum;
    const activityTotal = activityDoc.data().sumOthers - newSum;

    batch.update(summaryRef, { sumOthers: summaryTotal });
    batch.update(activityRef, { sumOthers: activityTotal });
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
