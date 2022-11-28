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

export const getExtraBudgetSubcontracts = async ({
  projectId,
  appStrings,
  successCallback,
  errorCallback,
}: { projectId: string } & IService) => {
  try {
    const subCtRef = collection(
      db,
      'projects',
      projectId,
      'projectExtraBudget',
      'summary',
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

export const getExtraBudgetSubcontractById = async ({
  projectId,
  extraBudgetSubcontractId,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  extraBudgetSubcontractId: string;
} & IService) => {
  try {
    const subCtRef = doc(
      db,
      'projects',
      projectId,
      'projectExtraBudget',
      'summary',
      'budgetSubcontracts',
      extraBudgetSubcontractId,
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

export const createExtraBudgetSubcontract = async ({
  projectId,
  extraBudgetSubcontract,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  extraBudgetSubcontract: IBudgetSubcontract;
} & IService) => {
  try {
    const data = await runTransaction(db, async transaction => {
      const { id, subtotal, ...rest } = extraBudgetSubcontract;
      const subCtRef = doc(
        collection(
          db,
          'projects',
          projectId,
          'projectExtraBudget',
          'summary',
          'budgetSubcontracts',
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

      const total = sumDoc.data().sumSubcontracts + subtotal;

      transaction.update(sumRef, { sumSubcontracts: total });
      transaction.set(subCtRef, rest);

      return {
        ...extraBudgetSubcontract,
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

export const updateExtraBudgetSubcontract = async ({
  projectId,
  extraBudgetSubcontract,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  extraBudgetSubcontract: IBudgetSubcontract;
} & IService) => {
  try {
    await runTransaction(db, async transaction => {
      const { id, subtotal, ...rest } = extraBudgetSubcontract;
      const subcontRef = doc(
        db,
        'projects',
        projectId,
        'projectExtraBudget',
        'summary',
        'budgetSubcontracts',
        id,
      );
      const sumRef = doc(
        db,
        'projects',
        projectId,
        'projectExtraBudget',
        'summary',
      );
      const subCtDoc = await transaction.get(subcontRef);
      const sumDoc = await transaction.get(sumRef);

      if (!subCtDoc.exists() || !sumDoc.exists())
        throw Error(appStrings.noRecords);

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

export const deleteExtraBudgetSubcontract = async ({
  projectId,
  extraBudgetSubcontractId,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  extraBudgetSubcontractId: string;
} & IService) => {
  try {
    const subCtRef = doc(
      db,
      'projects',
      projectId,
      'projectExtraBudget',
      'summary',
      'budgetSubcontracts',
      extraBudgetSubcontractId,
    );
    const sumRef = doc(
      db,
      'projects',
      projectId,
      'projectExtraBudget',
      'summary',
    );
    const subCtDoc = await getDoc(subCtRef);
    const sumDoc = await getDoc(sumRef);

    if (!subCtDoc.exists() || !sumDoc.exists())
      throw Error(appStrings.noRecords);

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
