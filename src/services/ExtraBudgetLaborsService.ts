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

export const getExtraBudgetLabors = async ({
  projectId,
  appStrings,
  successCallback,
  errorCallback,
}: { projectId: string } & IService) => {
  try {
    const laborRef = collection(
      db,
      'projects',
      projectId,
      'projectExtraBudget',
      'summary',
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

export const getExtraBudgetLaborById = async ({
  projectId,
  extraBudgetLaborId,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  extraBudgetLaborId: string;
} & IService) => {
  try {
    const laborRef = doc(
      db,
      'projects',
      projectId,
      'projectExtraBudget',
      'summary',
      'budgetLabors',
      extraBudgetLaborId,
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

export const createExtraBudgetLabor = async ({
  projectId,
  extraBudgetLabor,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  extraBudgetLabor: IBudgetLabor;
} & IService) => {
  try {
    const data = await runTransaction(db, async transaction => {
      const { id, subtotal, ...rest } = extraBudgetLabor;
      const laborRef = doc(
        collection(
          db,
          'projects',
          projectId,
          'projectExtraBudget',
          'summary',
          'budgetLabors',
        ),
      );
      const sumRef = doc(
        db,
        'projects',
        projectId,
        'projectExtraBudget',
        'summary',
      );
      const sumDoc = await transaction.get(sumRef);

      if (!sumDoc.exists()) throw Error(appStrings.noRecords);

      const total = sumDoc.data().sumLabors + subtotal;

      transaction.update(sumRef, { sumLabors: total });
      transaction.set(laborRef, rest);

      return {
        ...extraBudgetLabor,
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

export const updateExtraBudgetLabor = async ({
  projectId,
  extraBudgetLabor,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  extraBudgetLabor: IBudgetLabor;
} & IService) => {
  try {
    await runTransaction(db, async transaction => {
      const { id, subtotal, ...rest } = extraBudgetLabor;
      const laborRef = doc(
        db,
        'projects',
        projectId,
        'projectExtraBudget',
        'summary',
        'budgetLabors',
        id,
      );
      const sumRef = doc(
        db,
        'projects',
        projectId,
        'projectExtraBudget',
        'summary',
      );
      const laborDoc = await transaction.get(laborRef);
      const sumDoc = await transaction.get(sumRef);

      if (!laborDoc.exists() || !sumDoc.exists()) {
        throw Error(appStrings.noRecords);
      }

      const newSum = subtotal - laborDoc.data().cost * laborDoc.data().quantity;
      const total = sumDoc.data().sumLabors + newSum;

      transaction.update(sumRef, { sumLabors: total });
      transaction.set(laborRef, rest);
    });

    toastSuccess(appStrings.success, appStrings.saveSuccess);

    successCallback && successCallback();
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.saveError, errorMessage);

    errorCallback && errorCallback();
  }
};

export const deleteExtraBudgetLabor = async ({
  projectId,
  extraBudgetLaborId,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  extraBudgetLaborId: string;
} & IService) => {
  try {
    const laborRef = doc(
      db,
      'projects',
      projectId,
      'projectExtraBudget',
      'summary',
      'budgetLabors',
      extraBudgetLaborId,
    );
    const sumRef = doc(
      db,
      'projects',
      projectId,
      'projectExtraBudget',
      'summary',
    );
    const laborDoc = await getDoc(laborRef);
    const sumDoc = await getDoc(sumRef);

    if (!laborDoc.exists() || !sumDoc.exists()) {
      throw Error(appStrings.noRecords);
    }

    const batch = writeBatch(db);
    const newSum = laborDoc.data().cost * laborDoc.data().quantity;
    const total = sumDoc.data().sumLabors - newSum;

    batch.update(sumRef, { sumLabors: total });
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
