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
import { IBudgetLabor } from '../types/budgetLabor';
import { IService } from '../types/service';
import { toastSuccess, toastError } from '../utils/toast';

export const getBudgetLabors = async ({
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
      'projectBudget',
      activityId,
      'budgetLabors',
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

export const getBudgetLaborById = async ({
  projectId,
  activityId,
  budgetLaborId,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  activityId: string;
  budgetLaborId: string;
} & IService) => {
  try {
    const laborRef = doc(
      db,
      'projects',
      projectId,
      'projectBudget',
      activityId,
      'budgetLabors',
      budgetLaborId,
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

export const createBudgetLabor = async ({
  projectId,
  activityId,
  budgetLabor,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  activityId: string;
  budgetLabor: IBudgetLabor;
} & IService) => {
  try {
    const data = await runTransaction(db, async transaction => {
      const { id, subtotal, ...rest } = budgetLabor;
      const budgetRef = collection(db, 'projects', projectId, 'projectBudget');
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
      transaction.set(laborRef, rest);

      return {
        ...budgetLabor,
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

export const updateBudgetLabor = async ({
  projectId,
  activityId,
  budgetLabor,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  activityId: string;
  budgetLabor: IBudgetLabor;
} & IService) => {
  try {
    await runTransaction(db, async transaction => {
      const { id, subtotal, ...rest } = budgetLabor;
      const budgetRef = collection(db, 'projects', projectId, 'projectBudget');
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
      transaction.set(laborRef, rest);
    });

    toastSuccess(appStrings.success, appStrings.saveSuccess);

    successCallback && successCallback(budgetLabor);
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.saveError, errorMessage);

    errorCallback && errorCallback();
  }
};

export const deleteBudgetLabor = async ({
  projectId,
  activityId,
  budgetLaborId,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  activityId: string;
  budgetLaborId: string;
} & IService) => {
  try {
    const budgetRef = collection(db, 'projects', projectId, 'projectBudget');
    const laborRef = doc(budgetRef, activityId, 'budgetLabors', budgetLaborId);
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
