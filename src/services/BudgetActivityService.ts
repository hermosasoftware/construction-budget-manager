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
  onSnapshot,
  FirestoreError,
} from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { db } from '../config/firebaseConfig';
import { IBudgetActivity } from '../types/budgetActivity';
import { IService } from '../types/service';
import { toastSuccess, toastError } from '../utils/toast';
import { deleteCollect, listenersList } from './herperService';
import {
  changeBudgetActivities,
  insertBudgetActivity,
  modifyBudgetActivity,
  removeBudgetActivity,
} from '../redux/reducers/budgetActivitiesSlice';
import { store } from '../redux/store';

export const listenBudgetActivities = ({
  projectId,
  appStrings,
  successCallback,
  errorCallback,
}: { projectId: string } & IService) => {
  try {
    const actRef = collection(db, 'projects', projectId, 'projectBudget');
    const budgetActivitiesQuery = query(
      actRef,
      where(documentId(), '!=', 'summary'),
    );
    const { dispatch, getState } = store;

    const unsubscribe = onSnapshot(
      budgetActivitiesQuery,
      querySnapshot => {
        let activitiesList = [...getState().budgetActivities.budgetActivities];

        const budgetActivities: any = querySnapshot
          .docChanges()
          .map(async change => {
            const elem = {
              ...change.doc.data(),
              id: change.doc.id,
              date: change.doc.data().date.toDate().toISOString(),
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

        Promise.all(budgetActivities).then(result => {
          result.flat().length && dispatch(changeBudgetActivities(result));
        });
      },
      error => {
        const index = listenersList.findIndex(
          e => e.name === 'budgetActivities',
        );
        if (index !== -1) {
          listenersList.splice(index, 1);
          dispatch(changeBudgetActivities([]));
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
    dispatch(insertBudgetActivity(elem));
    return [];
  } else {
    return elem;
  }
};

const changeTypeModified = async (dispatch: any, elem: IBudgetActivity) => {
  dispatch(modifyBudgetActivity(elem));
  return [];
};

const changeTypeRemoved = async (dispatch: any, elem: IBudgetActivity) => {
  dispatch(removeBudgetActivity(elem));
  return [];
};

export const getBudgetActivity = async ({
  projectId,
  appStrings,
  successCallback,
  errorCallback,
}: { projectId: string } & IService) => {
  try {
    const actRef = query(
      collection(db, 'projects', projectId, 'projectBudget'),
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

export const getBudgetActivityById = async ({
  projectId,
  budgetActivityId,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  budgetActivityId: string;
} & IService) => {
  try {
    const actRef = doc(
      db,
      'projects',
      projectId,
      'projectBudget',
      budgetActivityId,
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

export const createBudgetActivity = async ({
  projectId,
  budgetActivity,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  budgetActivity: IBudgetActivity;
} & IService) => {
  try {
    const { id, ...rest } = budgetActivity;
    const actRef = collection(db, 'projects', projectId, 'projectBudget');
    const result = await addDoc(actRef, rest);
    const data = {
      ...budgetActivity,
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

export const updateBudgetActivity = async ({
  projectId,
  budgetActivity,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  budgetActivity: IBudgetActivity;
} & IService) => {
  try {
    const { id, ...rest } = budgetActivity;
    const actRef = doc(db, 'projects', projectId, 'projectBudget', id);
    await setDoc(actRef, rest);

    toastSuccess(appStrings.success, appStrings.saveSuccess);

    successCallback && successCallback(budgetActivity);
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.saveError, errorMessage);

    errorCallback && errorCallback();
  }
};

export const deleteBudgetActivity = async ({
  projectId,
  budgetActivityId,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  budgetActivityId: string;
} & IService) => {
  try {
    const actRef = doc(
      db,
      'projects',
      projectId,
      'projectBudget',
      budgetActivityId,
    );
    const sumRef = doc(db, 'projects', projectId, 'projectBudget', 'summary');
    const actDoc = await getDoc(actRef);
    const sumDoc = await getDoc(sumRef);

    if (!actDoc.exists() || !sumDoc.exists()) {
      throw Error(appStrings.noRecords);
    }

    await deleteCollect(`${actRef.path}/budgetMaterials`, ['subMaterials']);

    const batch = writeBatch(db);

    batch.update(sumRef, {
      sumMaterials: increment(-actDoc.data().sumMaterials),
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
