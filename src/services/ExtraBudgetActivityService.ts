import {
  collection,
  getDocs,
  getDoc,
  doc,
  writeBatch,
  addDoc,
  setDoc,
  query,
  where,
  documentId,
  increment,
  updateDoc,
  onSnapshot,
  FirestoreError,
  serverTimestamp,
  orderBy,
} from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { db } from '../config/firebaseConfig';
import { IBudgetActivity } from '../types/budgetActivity';
import { IService } from '../types/service';
import { toastSuccess, toastError } from '../utils/toast';
import { deleteCollect, listenersList } from './herperService';
import { store } from '../redux/store';
import {
  changeExtraActivities,
  insertExtraActivity,
  modifyExtraActivity,
  removeExtraActivity,
} from '../redux/reducers/extraActivitiesSlice';

export const listenExtraActivities = ({
  projectId,
  appStrings,
  successCallback,
  errorCallback,
}: { projectId: string } & IService) => {
  try {
    const actRef = collection(db, 'projects', projectId, 'projectExtraBudget');
    const extraActivitiesQuery = query(actRef, orderBy('createdAt'));
    const { dispatch, getState } = store;

    const unsubscribe = onSnapshot(
      extraActivitiesQuery,
      querySnapshot => {
        let activitiesList = [...getState().extraActivities.extraActivities];

        const extraActivities: any = querySnapshot
          .docChanges()
          .map(async change => {
            const elem = {
              ...change.doc.data(),
              id: change.doc.id,
              date: change.doc.data().date.toDate().toISOString(),
              createdAt: change.doc.data()?.createdAt?.toDate()?.toISOString(),
              updatedAt: change.doc.data()?.updatedAt?.toDate()?.toISOString(),
            } as IBudgetActivity;

            if (change.type === 'added') {
              return changeTypeAdded(dispatch, activitiesList, elem);
            }
            if (change.type === 'modified') {
              return changeTypeModified(dispatch, elem);
            }
            if (change.type === 'removed') {
              return changeTypeRemoved(dispatch, elem);
            }
          });

        Promise.all(extraActivities).then(result => {
          result.flat().length && dispatch(changeExtraActivities(result));
        });
      },
      error => {
        const index = listenersList.findIndex(
          e => e.name === 'extraActivities',
        );
        if (index !== -1) {
          listenersList.splice(index, 1);
          dispatch(changeExtraActivities([]));
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
  activitiesList: IBudgetActivity[],
  elem: IBudgetActivity,
) => {
  if (activitiesList.length > 0) {
    dispatch(insertExtraActivity(elem));
    return [];
  } else {
    return elem;
  }
};

const changeTypeModified = async (dispatch: any, elem: IBudgetActivity) => {
  dispatch(modifyExtraActivity(elem));
  return [];
};

const changeTypeRemoved = async (dispatch: any, elem: IBudgetActivity) => {
  dispatch(removeExtraActivity(elem));
  return [];
};

export const getExtraBudgetActivity = async ({
  projectId,
  appStrings,
  successCallback,
  errorCallback,
}: { projectId: string } & IService) => {
  try {
    const actRef = query(
      collection(db, 'projects', projectId, 'projectExtraBudget'),
      where(documentId(), '!=', 'summary'),
    );
    const result = await getDocs(actRef);
    const data = result.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      date: doc.data().date.toDate(),
    })) as IBudgetActivity[];

    successCallback && successCallback(data);
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.getInformationError, errorMessage);

    errorCallback && errorCallback();
  }
};

export const getExtraBudgetActivityById = async ({
  projectId,
  extraBudgetActivityId,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  extraBudgetActivityId: string;
} & IService) => {
  try {
    const actRef = doc(
      db,
      'projects',
      projectId,
      'projectExtraBudget',
      extraBudgetActivityId,
    );
    const result = await getDoc(actRef);
    const data = {
      ...result.data(),
      id: result.id,
      date: result.data()?.date.toDate(),
    } as IBudgetActivity;

    successCallback && successCallback(data);
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.getInformationError, errorMessage);

    errorCallback && errorCallback();
  }
};

export const createExtraBudgetActivity = async ({
  projectId,
  extraBudgetActivity,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  extraBudgetActivity: IBudgetActivity;
} & IService) => {
  try {
    const { id, ...rest } = extraBudgetActivity;
    const actRef = collection(db, 'projects', projectId, 'projectExtraBudget');
    const result = await addDoc(actRef, {
      ...rest,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    const data = {
      ...extraBudgetActivity,
      id: result.id,
    } as IBudgetActivity;

    toastSuccess(appStrings.success, appStrings.saveSuccess);

    successCallback && successCallback(data);
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.saveError, errorMessage);

    errorCallback && errorCallback();
  }
};

export const updateExtraBudgetActivity = async ({
  projectId,
  extraBudgetActivity,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  extraBudgetActivity: IBudgetActivity;
} & IService) => {
  try {
    const { id, ...rest } = extraBudgetActivity;
    const actRef = doc(db, 'projects', projectId, 'projectExtraBudget', id);
    await setDoc(actRef, { ...rest, updatedAt: serverTimestamp() });

    toastSuccess(appStrings.success, appStrings.saveSuccess);

    successCallback && successCallback(extraBudgetActivity);
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.saveError, errorMessage);

    errorCallback && errorCallback();
  }
};

export const updateExtraBudgetActivityExchange = async ({
  projectId,
  extraBudgetActivityId,
  exchange,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  extraBudgetActivityId: string;
  exchange: number;
} & IService) => {
  try {
    const extraBudgetRef = doc(
      db,
      'projects',
      projectId,
      'projectExtraBudget',
      extraBudgetActivityId,
    );
    await updateDoc(extraBudgetRef, { exchange });

    toastSuccess(appStrings.success, appStrings.saveSuccess);

    successCallback && successCallback();
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.saveError, errorMessage);

    errorCallback && errorCallback();
  }
};

export const updateExtraBudgetActivityAdminFee = async ({
  projectId,
  extraBudgetActivityId,
  adminFee,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  extraBudgetActivityId: string;
  adminFee: number;
} & IService) => {
  try {
    const extraBudgetRef = doc(
      db,
      'projects',
      projectId,
      'projectExtraBudget',
      extraBudgetActivityId,
    );
    await updateDoc(extraBudgetRef, { adminFee });

    toastSuccess(appStrings.success, appStrings.saveSuccess);

    successCallback && successCallback();
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.saveError, errorMessage);

    errorCallback && errorCallback();
  }
};

export const deleteExtraBudgetActivity = async ({
  projectId,
  extraBudgetActivityId,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  extraBudgetActivityId: string;
} & IService) => {
  try {
    const actRef = doc(
      db,
      'projects',
      projectId,
      'projectExtraBudget',
      extraBudgetActivityId,
    );
    const sumRef = doc(
      db,
      'projects',
      projectId,
      'projectExtraBudget',
      'summary',
    );
    const actDoc = await getDoc(actRef);
    const sumDoc = await getDoc(sumRef);

    if (!actDoc.exists() || !sumDoc.exists()) {
      throw Error(appStrings.noRecords);
    }

    await deleteCollect(`${actRef.path}/budgetMaterials`, ['subMaterials']);
    await deleteCollect(`${actRef.path}/budgetLabors`);
    await deleteCollect(`${actRef.path}/budgetSubcontracts`);
    await deleteCollect(`${actRef.path}/budgetOthers`);

    const batch = writeBatch(db);

    batch.update(sumRef, {
      sumMaterials: increment(-actDoc.data().sumMaterials),
      sumLabors: increment(-actDoc.data().sumLabors),
      sumSubcontracts: increment(-actDoc.data().sumSubcontracts),
      sumOthers: increment(-actDoc.data().sumOthers),
    });
    batch.delete(actRef);

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
