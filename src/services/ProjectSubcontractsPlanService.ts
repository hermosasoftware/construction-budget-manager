import {
  collection,
  getDocs,
  getDoc,
  doc,
  runTransaction,
} from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { db } from '../config/firebaseConfig';
import { IProjectSubcontractPlan } from '../types/projectSubcontractPlan';
import { IService } from '../types/service';
import { toastSuccess, toastError } from '../utils/toast';

export const getProjectSubcontractsPlan = async ({
  projectId,
  appStrings,
  successCallback,
  errorCallback,
}: { projectId: string } & IService) => {
  try {
    const userRef = collection(
      db,
      'projects',
      projectId,
      'projectSubcontractsPlan',
    );
    const result = await getDocs(userRef);
    const data = result.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      subtotal: doc.data().cost * doc.data().quantity,
    })) as IProjectSubcontractPlan[];

    successCallback && successCallback(data);
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.getInformationError, errorMessage);

    errorCallback && errorCallback();
  }
};

export const getProjectSubcontractPlanById = async ({
  projectId,
  projectSubcontractPlanId,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  projectSubcontractPlanId: string;
} & IService) => {
  try {
    const userRef = doc(
      db,
      'projects',
      projectId,
      'projectSubcontractsPlan',
      projectSubcontractPlanId,
    );
    const result = await getDoc(userRef);
    const data = {
      ...result.data(),
      id: result.id,
      subtotal: result.data()?.cost * result.data()?.quantity,
    } as IProjectSubcontractPlan;

    successCallback && successCallback(data);
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.getInformationError, errorMessage);

    errorCallback && errorCallback();
  }
};

export const createProjectSubcontractPlan = async ({
  projectId,
  projectSubcontractPlan,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  projectSubcontractPlan: IProjectSubcontractPlan;
} & IService) => {
  try {
    const data = await runTransaction(db, async transaction => {
      const { id, subtotal, ...rest } = projectSubcontractPlan;
      const subCtRef = doc(
        collection(db, 'projects', projectId, 'projectSubcontractsPlan'),
      );
      const sumRef = doc(db, 'projects', projectId, 'projectBudget', 'summary');
      const sumDoc = await transaction.get(sumRef);

      if (!sumDoc.exists()) throw Error();

      const total = sumDoc.data().sumSubcontracts + subtotal;

      transaction.update(sumRef, { sumSubcontracts: total });
      transaction.set(subCtRef, rest);

      return {
        ...projectSubcontractPlan,
        id: subCtRef.id,
      } as IProjectSubcontractPlan;
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

export const updateProjectSubcontractPlan = async ({
  projectId,
  projectSubcontractPlan,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  projectSubcontractPlan: IProjectSubcontractPlan;
} & IService) => {
  try {
    await runTransaction(db, async transaction => {
      const { id, subtotal, ...rest } = projectSubcontractPlan;
      const subcontRef = doc(
        db,
        'projects',
        projectId,
        'projectSubcontractsPlan',
        id,
      );
      const sumRef = doc(db, 'projects', projectId, 'projectBudget', 'summary');
      const subCtDoc = await transaction.get(subcontRef);
      const sumDoc = await transaction.get(sumRef);

      if (!subCtDoc.exists() || !sumDoc.exists()) throw Error();

      const newSum = subtotal - subCtDoc.data().cost * subCtDoc.data().quantity;
      const total = sumDoc.data().sumSubcontracts + newSum;

      transaction.update(sumRef, { sumSubcontracts: total });
      transaction.set(subcontRef, rest);
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
