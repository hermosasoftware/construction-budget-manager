import {
  collection,
  getDocs,
  getDoc,
  doc,
  runTransaction,
  writeBatch,
} from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { db } from '../config/firebaseConfig';
import { IBudgetSubcontract } from '../types/budgetSubcontract';
import { IService } from '../types/service';
import { toastSuccess, toastError } from '../utils/toast';

export const getBudgetSubcontracts = async ({
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
      'projectBudget',
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

export const getBudgetSubcontractById = async ({
  projectId,
  activityId,
  budgetSubcontractId,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  activityId: string;
  budgetSubcontractId: string;
} & IService) => {
  try {
    const subCtRef = doc(
      db,
      'projects',
      projectId,
      'projectBudget',
      activityId,
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
  activityId,
  budgetSubcontract,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  activityId: string;
  budgetSubcontract: IBudgetSubcontract;
} & IService) => {
  try {
    const data = await runTransaction(db, async transaction => {
      const { id, subtotal, ...rest } = budgetSubcontract;
      const budgetRef = collection(db, 'projects', projectId, 'projectBudget');
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
  activityId,
  budgetSubcontract,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  activityId: string;
  budgetSubcontract: IBudgetSubcontract;
} & IService) => {
  try {
    await runTransaction(db, async transaction => {
      const { id, subtotal, ...rest } = budgetSubcontract;
      const budgetRef = collection(db, 'projects', projectId, 'projectBudget');
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
  activityId,
  budgetSubcontractId,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  activityId: string;
  budgetSubcontractId: string;
} & IService) => {
  try {
    const budgetRef = collection(db, 'projects', projectId, 'projectBudget');
    const subCtRef = doc(
      budgetRef,
      activityId,
      'budgetSubcontracts',
      budgetSubcontractId,
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
