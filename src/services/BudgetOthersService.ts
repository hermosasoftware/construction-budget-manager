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
import { IBudgetOther } from '../types/budgetOther';
import { IService } from '../types/service';
import { toastSuccess, toastError } from '../utils/toast';

export const getBudgetOthers = async ({
  projectId,
  activityId,
  appStrings,
  successCallback,
  errorCallback,
}: { projectId: string; activityId?: string } & IService) => {
  try {
    const OtherRef = collection(
      db,
      'projects',
      projectId,
      'projectBudget',
      activityId || 'summary',
      'budgetOthers',
    );
    const result = await getDocs(OtherRef);
    const data = result.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      subtotal: doc.data().cost * doc.data().quantity,
    })) as IBudgetOther[];

    successCallback && successCallback(data);
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.getInformationError, errorMessage);

    errorCallback && errorCallback();
  }
};

export const getBudgetOtherById = async ({
  projectId,
  activityId,
  budgetOtherId,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  activityId: string;
  budgetOtherId: string;
} & IService) => {
  try {
    const OtherRef = doc(
      db,
      'projects',
      projectId,
      'projectBudget',
      activityId,
      'budgetOthers',
      budgetOtherId,
    );
    const result = await getDoc(OtherRef);
    const data = {
      ...result.data(),
      id: result.id,
      subtotal: result.data()?.cost * result.data()?.quantity,
    } as IBudgetOther;

    successCallback && successCallback(data);
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.getInformationError, errorMessage);

    errorCallback && errorCallback();
  }
};

export const createBudgetOther = async ({
  projectId,
  activityId,
  budgetOther,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  activityId: string;
  budgetOther: IBudgetOther;
} & IService) => {
  try {
    const data = await runTransaction(db, async transaction => {
      const { id, subtotal, ...rest } = budgetOther;
      const budgetRef = collection(db, 'projects', projectId, 'projectBudget');
      const OtherRef = doc(collection(budgetRef, activityId, 'budgetOthers'));
      const summaryRef = doc(budgetRef, 'summary');
      const activityRef = doc(budgetRef, activityId);
      const summaryDoc = await transaction.get(summaryRef);
      const activityDoc = await transaction.get(activityRef);

      if (!summaryDoc.exists() || !activityDoc.exists()) {
        throw Error(appStrings.noRecords);
      }

      const summaryTotal = summaryDoc.data().sumOthers + subtotal;
      const activityTotal = activityDoc.data().sumOthers + subtotal;

      transaction.update(summaryRef, { sumOthers: summaryTotal });
      transaction.update(activityRef, { sumOthers: activityTotal });
      transaction.set(OtherRef, rest);

      return {
        ...budgetOther,
        id: OtherRef.id,
      } as IBudgetOther;
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

export const updateBudgetOther = async ({
  projectId,
  activityId,
  budgetOther,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  activityId: string;
  budgetOther: IBudgetOther;
} & IService) => {
  try {
    await runTransaction(db, async transaction => {
      const { id, subtotal, ...rest } = budgetOther;
      const budgetRef = collection(db, 'projects', projectId, 'projectBudget');
      const OtherRef = doc(budgetRef, activityId, 'budgetOthers', id);
      const summaryRef = doc(budgetRef, 'summary');
      const activityRef = doc(budgetRef, activityId);
      const OtherDoc = await transaction.get(OtherRef);
      const summaryDoc = await transaction.get(summaryRef);
      const activityDoc = await transaction.get(activityRef);

      if (!OtherDoc.exists() || !summaryDoc.exists() || !activityDoc.exists()) {
        throw Error(appStrings.noRecords);
      }

      const newSum = subtotal - OtherDoc.data().cost * OtherDoc.data().quantity;
      const summaryTotal = summaryDoc.data().sumOthers + newSum;
      const activityTotal = activityDoc.data().sumOthers + newSum;

      transaction.update(summaryRef, { sumOthers: summaryTotal });
      transaction.update(activityRef, { sumOthers: activityTotal });
      transaction.set(OtherRef, rest);
    });

    toastSuccess(appStrings.success, appStrings.saveSuccess);

    successCallback && successCallback(budgetOther);
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.saveError, errorMessage);

    errorCallback && errorCallback();
  }
};

export const deleteBudgetOther = async ({
  projectId,
  activityId,
  budgetOtherId,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  activityId: string;
  budgetOtherId: string;
} & IService) => {
  try {
    const budgetRef = collection(db, 'projects', projectId, 'projectBudget');
    const OtherRef = doc(budgetRef, activityId, 'budgetOthers', budgetOtherId);
    const summaryRef = doc(budgetRef, 'summary');
    const activityRef = doc(budgetRef, activityId);
    const OtherDoc = await getDoc(OtherRef);
    const summaryDoc = await getDoc(summaryRef);
    const activityDoc = await getDoc(activityRef);

    if (!OtherDoc.exists() || !summaryDoc.exists() || !activityDoc.exists()) {
      throw Error(appStrings.noRecords);
    }

    const batch = writeBatch(db);
    const newSum = OtherDoc.data().cost * OtherDoc.data().quantity;
    const summaryTotal = summaryDoc.data().sumOthers - newSum;
    const activityTotal = activityDoc.data().sumOthers - newSum;

    batch.update(summaryRef, { sumOthers: summaryTotal });
    batch.update(activityRef, { sumOthers: activityTotal });
    batch.delete(OtherRef);

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
