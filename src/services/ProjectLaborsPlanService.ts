import {
  collection,
  getDocs,
  getDoc,
  doc,
  runTransaction,
} from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { db } from '../config/firebaseConfig';
import { IBudgetLabor } from '../types/budgetLabor';
import { IService } from '../types/service';
import { toastSuccess, toastError } from '../utils/toast';

export const getProjectLaborsPlan = async ({
  projectId,
  appStrings,
  successCallback,
  errorCallback,
}: { projectId: string } & IService) => {
  try {
    const userRef = collection(db, 'projects', projectId, 'projectLaborsPlan');
    const result = await getDocs(userRef);
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

export const getProjectLaborPlanById = async ({
  projectId,
  projectLaborPlanId,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  projectLaborPlanId: string;
} & IService) => {
  try {
    const userRef = doc(
      db,
      'projects',
      projectId,
      'projectLaborsPlan',
      projectLaborPlanId,
    );
    const result = await getDoc(userRef);
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

export const createProjectLaborPlan = async ({
  projectId,
  projectLaborPlan,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  projectLaborPlan: IBudgetLabor;
} & IService) => {
  try {
    const data = await runTransaction(db, async transaction => {
      const { id, subtotal, ...rest } = projectLaborPlan;
      const laborRef = doc(
        collection(db, 'projects', projectId, 'projectLaborsPlan'),
      );
      const sumRef = doc(db, 'projects', projectId, 'projectBudget', 'summary');
      const sumDoc = await transaction.get(sumRef);

      if (!sumDoc.exists()) throw Error(appStrings.noRecords);

      const total = sumDoc.data().sumLabors + subtotal;

      transaction.update(sumRef, { sumLabors: total });
      transaction.set(laborRef, rest);

      return {
        ...projectLaborPlan,
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

export const updateProjectLaborPlan = async ({
  projectId,
  projectLaborPlan,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  projectLaborPlan: IBudgetLabor;
} & IService) => {
  try {
    await runTransaction(db, async transaction => {
      const { id, subtotal, ...rest } = projectLaborPlan;
      const laborRef = doc(db, 'projects', projectId, 'projectLaborsPlan', id);
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
