import {
  collection,
  getDocs,
  getDoc,
  doc,
  runTransaction,
  writeBatch,
  addDoc,
  setDoc,
  query,
  where,
  documentId,
} from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { db } from '../config/firebaseConfig';
import { IBudgetActivity } from '../types/budgetActivity';
import { IService } from '../types/service';
import { toastSuccess, toastError } from '../utils/toast';

export const getBudgetActivity = async ({
  projectId,
  appStrings,
  successCallback,
  errorCallback,
}: { projectId: string } & IService) => {
  try {
    const subCtRef = query(
      collection(db, 'projects', projectId, 'projectBudget'),
      where(documentId(), '!=', 'summary'),
    );
    const result = await getDocs(subCtRef);
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
    const subCtRef = doc(
      db,
      'projects',
      projectId,
      'projectBudget',
      budgetActivityId,
    );
    const result = await getDoc(subCtRef);
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
    const subCtRef = collection(db, 'projects', projectId, 'projectBudget');
    const result = await addDoc(subCtRef, rest);
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
    const invRef = doc(db, 'projects', projectId, 'projectBudget', id);
    await setDoc(invRef, rest);

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
    const subCtRef = doc(
      db,
      'projects',
      projectId,
      'projectBudget',
      'summary',
      'budgetActivity',
      budgetActivityId,
    );
    const sumRef = doc(db, 'projects', projectId, 'projectBudget', 'summary');
    const subCtDoc = await getDoc(subCtRef);
    const sumDoc = await getDoc(sumRef);

    if (!subCtDoc.exists() || !sumDoc.exists()) {
      throw Error(appStrings.noRecords);
    }

    const batch = writeBatch(db);
    const newSum = subCtDoc.data().cost * subCtDoc.data().quantity;
    const total = sumDoc.data().sumSubcontracts - newSum;

    batch.update(sumRef, { sumSubcontracts: total });
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
