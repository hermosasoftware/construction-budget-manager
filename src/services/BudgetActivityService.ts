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
} from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { db } from '../config/firebaseConfig';
import { IBudgetActivity } from '../types/budgetActivity';
import { IService } from '../types/service';
import { toastSuccess, toastError } from '../utils/toast';
import { deleteCollect } from './herperService';

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
    await deleteCollect(`${actRef.path}/budgetLabors`);
    await deleteCollect(`${actRef.path}/budgetSubcontracts`);

    const batch = writeBatch(db);

    batch.update(sumRef, {
      sumMaterials: increment(-actDoc.data().sumMaterials),
      sumLabors: increment(-actDoc.data().sumLabors),
      sumSubcontracts: increment(-actDoc.data().sumSubcontracts),
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
