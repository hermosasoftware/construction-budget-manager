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
  appStrings,
  successCallback,
  errorCallback,
}: { projectId: string } & IService) => {
  try {
    const laborRef = collection(
      db,
      'projects',
      projectId,
      'projectBudget',
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

export const getBudgetLaborById = async ({
  projectId,
  budgetLaborId,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  budgetLaborId: string;
} & IService) => {
  try {
    const laborRef = doc(
      db,
      'projects',
      projectId,
      'projectBudget',
      'summary',
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
  budgetLabor,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  budgetLabor: IBudgetLabor;
} & IService) => {
  try {
    const data = await runTransaction(db, async transaction => {
      const { id, subtotal, ...rest } = budgetLabor;
      const laborRef = doc(
        collection(
          db,
          'projects',
          projectId,
          'projectBudget',
          'summary',
          'budgetLabors',
        ),
      );
      const sumRef = doc(db, 'projects', projectId, 'projectBudget', 'summary');
      const sumDoc = await transaction.get(sumRef);

      if (!sumDoc.exists()) throw Error(appStrings.noRecords);

      const total = sumDoc.data().sumLabors + subtotal;

      transaction.update(sumRef, { sumLabors: total });
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
  budgetLabor,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  budgetLabor: IBudgetLabor;
} & IService) => {
  try {
    await runTransaction(db, async transaction => {
      const { id, subtotal, ...rest } = budgetLabor;
      const laborRef = doc(
        db,
        'projects',
        projectId,
        'projectBudget',
        'summary',
        'budgetLabors',
        id,
      );
      const sumRef = doc(db, 'projects', projectId, 'projectBudget', 'summary');
      const laborDoc = await transaction.get(laborRef);
      const sumDoc = await transaction.get(sumRef);

      if (!laborDoc.exists() || !sumDoc.exists())
        throw Error(appStrings.noRecords);

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

export const deleteBudgetLabor = async ({
  projectId,
  budgetLaborId,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  budgetLaborId: string;
} & IService) => {
  try {
    const laborRef = doc(
      db,
      'projects',
      projectId,
      'projectBudget',
      'summary',
      'budgetLabors',
      budgetLaborId,
    );
    const sumRef = doc(db, 'projects', projectId, 'projectBudget', 'summary');
    const laborDoc = await getDoc(laborRef);
    const sumDoc = await getDoc(sumRef);

    if (!laborDoc.exists() || !sumDoc.exists())
      throw Error(appStrings.noRecords);

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
