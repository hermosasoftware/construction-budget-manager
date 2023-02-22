import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  runTransaction,
  writeBatch,
  addDoc,
  setDoc,
} from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { db } from '../config/firebaseConfig';
import { IBudgetMaterial } from '../types/budgetMaterial';
import { IService } from '../types/service';
import { toastSuccess, toastError } from '../utils/toast';
import { ISubMaterial } from '../types/collections';

export const getExtraBudgetMaterials = async ({
  projectId,
  activityId,
  appStrings,
  successCallback,
  errorCallback,
}: { projectId: string; activityId?: string } & IService) => {
  try {
    const matRef = collection(
      db,
      'projects',
      projectId,
      'projectExtraBudget',
      activityId || 'summary',
      'budgetMaterials',
    );
    const result = await getDocs(matRef);
    const data = result.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      subtotal: doc.data().cost * doc.data().quantity,
    })) as IBudgetMaterial[];

    let allMaterials = null;
    let submaterialsPromise = data.map(async elem => {
      const materialQ = query(
        collection(
          db,
          'projects',
          projectId,
          'projectExtraBudget',
          activityId || 'summary',
          'budgetMaterials',
          elem.id,
          'subMaterials',
        ),
      );
      const subMaterials = await getDocs(materialQ);
      const data = subMaterials.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      }));
      return { id: elem.id, material: elem, subMaterials: data };
    });
    await Promise.all(submaterialsPromise).then(resul => {
      allMaterials = resul;
    });

    successCallback && successCallback(allMaterials);
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.getInformationError, errorMessage);

    errorCallback && errorCallback();
  }
};

export const getExtraBudgetMaterialById = async ({
  projectId,
  activityId,
  extraBudgetMaterialId,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  activityId: string;
  extraBudgetMaterialId: string;
} & IService) => {
  try {
    const matRef = doc(
      db,
      'projects',
      projectId,
      'projectExtraBudget',
      activityId,
      'budgetMaterials',
      extraBudgetMaterialId,
    );
    const result = await getDoc(matRef);
    const data = {
      ...result.data(),
      id: result.id,
      subtotal: result.data()?.cost * result.data()?.quantity,
    } as IBudgetMaterial;

    successCallback && successCallback(data);
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.getInformationError, errorMessage);

    errorCallback && errorCallback();
  }
};

export const createExtraBudgetMaterial = async ({
  projectId,
  activityId,
  extraBudgetMaterial,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  activityId: string;
  extraBudgetMaterial: IBudgetMaterial;
} & IService) => {
  try {
    const data = await runTransaction(db, async transaction => {
      const { id, subtotal, subMaterials, ...rest } = extraBudgetMaterial;
      const budgetRef = collection(
        db,
        'projects',
        projectId,
        'projectExtraBudget',
      );
      const matRef = doc(collection(budgetRef, activityId, 'budgetMaterials'));
      const summaryRef = doc(budgetRef, 'summary');
      const activityRef = doc(budgetRef, activityId);
      const summaryDoc = await transaction.get(summaryRef);
      const activityDoc = await transaction.get(activityRef);

      if (!summaryDoc.exists() || !activityDoc.exists()) {
        throw Error(appStrings.noRecords);
      }

      const summaryTotal = summaryDoc.data().sumMaterials + subtotal;
      const activityTotal = activityDoc.data().sumMaterials + subtotal;

      transaction.update(summaryRef, { sumMaterials: summaryTotal });
      transaction.update(activityRef, { sumMaterials: activityTotal });
      transaction.set(matRef, rest);

      const batch = writeBatch(db);
      if (subMaterials) {
        subMaterials.forEach(e => {
          const { id, ...rest } = e;
          batch.set(doc(collection(matRef, 'subMaterials')), rest);
        });
      }
      await batch.commit();

      return {
        ...extraBudgetMaterial,
        subMaterials,
        id: matRef.id,
      } as IBudgetMaterial;
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

export const updateExtraBudgetMaterial = async ({
  projectId,
  activityId,
  extraBudgetMaterial,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  activityId: string;
  extraBudgetMaterial: IBudgetMaterial;
} & IService) => {
  try {
    await runTransaction(db, async transaction => {
      const { id, subtotal, subMaterials, ...rest } = extraBudgetMaterial;
      const budgetRef = collection(
        db,
        'projects',
        projectId,
        'projectExtraBudget',
      );
      const matRef = doc(budgetRef, activityId, 'budgetMaterials', id);
      const summaryRef = doc(budgetRef, 'summary');
      const activityRef = doc(budgetRef, activityId);
      const matDoc = await transaction.get(matRef);
      const summaryDoc = await transaction.get(summaryRef);
      const activityDoc = await transaction.get(activityRef);

      if (!matDoc.exists() || !summaryDoc.exists() || !activityDoc.exists()) {
        throw Error(appStrings.noRecords);
      }

      const newSum = subtotal - matDoc.data().cost * matDoc.data().quantity;
      const summaryTotal = summaryDoc.data().sumMaterials + newSum;
      const activityTotal = activityDoc.data().sumMaterials + newSum;

      transaction.update(summaryRef, { sumMaterials: summaryTotal });
      transaction.update(activityRef, { sumMaterials: activityTotal });
      transaction.set(matRef, rest);
    });

    toastSuccess(appStrings.success, appStrings.saveSuccess);

    successCallback && successCallback(extraBudgetMaterial);
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.saveError, errorMessage);

    errorCallback && errorCallback();
  }
};

export const deleteExtraBudgetMaterial = async ({
  projectId,
  activityId,
  extraBudgetMaterialId,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  activityId: string;
  extraBudgetMaterialId: string;
} & IService) => {
  try {
    const budgetRef = collection(
      db,
      'projects',
      projectId,
      'projectExtraBudget',
    );
    const matRef = doc(
      budgetRef,
      activityId,
      'budgetMaterials',
      extraBudgetMaterialId,
    );
    const subMatRef = collection(matRef, 'subMaterials');
    const summaryRef = doc(budgetRef, 'summary');
    const activityRef = doc(budgetRef, activityId);
    const matDoc = await getDoc(matRef);
    const subMatDocs = await getDocs(subMatRef);
    const summaryDoc = await getDoc(summaryRef);
    const activityDoc = await getDoc(activityRef);

    if (!matDoc.exists() || !summaryDoc.exists() || !activityDoc.exists()) {
      throw Error(appStrings.noRecords);
    }

    const batch = writeBatch(db);
    for (const subMaterial of subMatDocs.docs) {
      batch.delete(doc(subMatRef, subMaterial.id));
    }

    const newSum = matDoc.data().cost * matDoc.data().quantity;
    const summaryTotal = summaryDoc.data().sumMaterials - newSum;
    const activityTotal = activityDoc.data().sumMaterials - newSum;

    batch.update(summaryRef, { sumMaterials: summaryTotal });
    batch.update(activityRef, { sumMaterials: activityTotal });
    batch.delete(matRef);

    await batch.commit();

    toastSuccess(appStrings.success, appStrings.saveSuccess);

    successCallback && successCallback();
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.deleteError, errorMessage);

    errorCallback && errorCallback();
  }
};

export const createExtraBudgetSubMaterial = async ({
  projectId,
  activityId,
  materialId,
  budgetSubMaterial,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  activityId: string;
  materialId: string;
  budgetSubMaterial: ISubMaterial;
} & IService) => {
  try {
    const { id, ...rest } = budgetSubMaterial;
    const subMatRef = collection(
      db,
      'projects',
      projectId,
      'projectExtraBudget',
      activityId,
      'budgetMaterials',
      materialId,
      'subMaterials',
    );

    const docRef = await addDoc(subMatRef, rest);

    toastSuccess(appStrings.success, appStrings.saveSuccess);

    successCallback && successCallback(materialId, docRef.id);
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.saveError, errorMessage);

    errorCallback && errorCallback();
  }
};

export const updateExtraBudgetSubMaterial = async ({
  projectId,
  activityId,
  materialId,
  budgetSubMaterial,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  activityId: string;
  materialId: string;
  budgetSubMaterial: ISubMaterial;
} & IService) => {
  try {
    const { id, ...rest } = budgetSubMaterial;
    const subMaterialDocRef = doc(
      db,
      'projects',
      projectId,
      'projectExtraBudget',
      activityId,
      'budgetMaterials',
      materialId,
      'subMaterials',
      id,
    );
    await setDoc(subMaterialDocRef, rest);
    toastSuccess(appStrings.success, appStrings.saveSuccess);
    successCallback && successCallback(materialId, id);
  } catch (e) {
    errorCallback && errorCallback();
  }
};

export const deleteExtraBudgetSubMaterial = async ({
  projectId,
  activityId,
  extraBudgetMaterialId,
  extraBudgetSubMaterialId,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  activityId: string;
  extraBudgetMaterialId: string;
  extraBudgetSubMaterialId: string;
} & IService) => {
  try {
    const budgetRef = collection(
      db,
      'projects',
      projectId,
      'projectExtraBudget',
    );
    const matRef = doc(
      budgetRef,
      activityId,
      'budgetMaterials',
      extraBudgetMaterialId,
    );
    const subMatRef = doc(matRef, 'subMaterials', extraBudgetSubMaterialId);
    const summaryRef = doc(budgetRef, 'summary');
    const activityRef = doc(budgetRef, activityId);
    const matDoc = await getDoc(matRef);
    const subMatDoc = await getDoc(subMatRef);
    const summaryDoc = await getDoc(summaryRef);
    const activityDoc = await getDoc(activityRef);

    if (
      !matDoc.exists() ||
      !subMatDoc.exists() ||
      !summaryDoc.exists() ||
      !activityDoc.exists()
    ) {
      throw Error(appStrings.noRecords);
    }

    const batch = writeBatch(db);

    const totalSubMat = subMatDoc.data().cost * subMatDoc.data().quantity;
    const totalMatCost = matDoc.data().cost - totalSubMat;
    const totalMatSum = totalMatCost * matDoc.data().quantity;
    const summaryTotal = summaryDoc.data().sumMaterials - totalMatSum;
    const activityTotal = activityDoc.data().sumMaterials - totalMatSum;

    batch.update(matRef, { cost: totalMatCost });
    batch.update(summaryRef, { sumMaterials: summaryTotal });
    batch.update(activityRef, { sumMaterials: activityTotal });
    batch.delete(subMatRef);

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
