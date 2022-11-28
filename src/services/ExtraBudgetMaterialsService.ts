import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  runTransaction,
  writeBatch,
} from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { db } from '../config/firebaseConfig';
import { IBudgetMaterial } from '../types/budgetMaterial';
import { IService } from '../types/service';
import { toastSuccess, toastError } from '../utils/toast';

export const getExtraBudgetMaterials = async ({
  projectId,
  appStrings,
  successCallback,
  errorCallback,
}: { projectId: string } & IService) => {
  try {
    const matRef = collection(
      db,
      'projects',
      projectId,
      'projectExtraBudget',
      'summary',
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
          'summary',
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
  extraBudgetMaterialId,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  extraBudgetMaterialId: string;
} & IService) => {
  try {
    const matRef = doc(
      db,
      'projects',
      projectId,
      'projectExtraBudget',
      'summary',
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
  extraBudgetMaterial,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  extraBudgetMaterial: IBudgetMaterial;
} & IService) => {
  try {
    const data = await runTransaction(db, async transaction => {
      const { id, subtotal, ...rest } = extraBudgetMaterial;
      const matRef = doc(
        collection(
          db,
          'projects',
          projectId,
          'projectExtraBudget',
          'summary',
          'budgetMaterials',
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

      const total = sumDoc.data().sumMaterials + subtotal;

      transaction.update(sumRef, { sumMaterials: total });
      transaction.set(matRef, rest);

      return {
        ...extraBudgetMaterial,
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
  extraBudgetMaterial,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  extraBudgetMaterial: IBudgetMaterial;
} & IService) => {
  try {
    await runTransaction(db, async transaction => {
      const { id, subtotal, ...rest } = extraBudgetMaterial;
      const matRef = doc(
        db,
        'projects',
        projectId,
        'projectExtraBudget',
        'summary',
        'budgetMaterials',
        id,
      );
      const sumRef = doc(
        db,
        'projects',
        projectId,
        'projectExtraBudget',
        'summary',
      );
      const matDoc = await transaction.get(matRef);
      const sumDoc = await transaction.get(sumRef);

      if (!matDoc.exists() || !sumDoc.exists())
        throw Error(appStrings.noRecords);

      const newSum = subtotal - matDoc.data().cost * matDoc.data().quantity;
      const total = sumDoc.data().sumMaterials + newSum;

      transaction.update(sumRef, { sumMaterials: total });
      transaction.set(matRef, rest);
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

export const deleteExtraBudgetMaterial = async ({
  projectId,
  extraBudgetMaterialId,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  extraBudgetMaterialId: string;
} & IService) => {
  try {
    const matRef = doc(
      db,
      'projects',
      projectId,
      'projectExtraBudget',
      'summary',
      'budgetMaterials',
      extraBudgetMaterialId,
    );
    const subMatRef = collection(matRef, 'subMaterials');
    const sumRef = doc(
      db,
      'projects',
      projectId,
      'projectExtraBudget',
      'summary',
    );
    const sumDoc = await getDoc(sumRef);
    const matDoc = await getDoc(matRef);
    const subMatDocs = await getDocs(subMatRef);

    if (!matDoc.exists() || !sumDoc.exists()) throw Error(appStrings.noRecords);

    const batch = writeBatch(db);
    for (const subMaterial of subMatDocs.docs)
      batch.delete(doc(subMatRef, subMaterial.id));

    const newSum = matDoc.data().cost * matDoc.data().quantity;
    const total = sumDoc.data().sumMaterials - newSum;
    batch.update(sumRef, { sumMaterials: total });
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

export const deleteExtraBudgetSubMaterial = async ({
  projectId,
  extraBudgetMaterialId,
  extraBudgetSubMaterialId,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  extraBudgetMaterialId: string;
  extraBudgetSubMaterialId: string;
} & IService) => {
  try {
    const matRef = doc(
      db,
      'projects',
      projectId,
      'projectExtraBudget',
      'summary',
      'budgetMaterials',
      extraBudgetMaterialId,
    );
    const subMatRef = doc(
      collection(matRef, 'subMaterials'),
      extraBudgetSubMaterialId,
    );
    const sumRef = doc(
      db,
      'projects',
      projectId,
      'projectExtraBudget',
      'summary',
    );
    const sumDoc = await getDoc(sumRef);
    const matDoc = await getDoc(matRef);
    const subMatDoc = await getDoc(subMatRef);

    if (!matDoc.exists() || !sumDoc.exists() || !subMatDoc.exists())
      throw Error(appStrings.noRecords);

    const batch = writeBatch(db);

    const totalSubMat = subMatDoc.data().cost * subMatDoc.data().quantity;
    const totalMatCost = matDoc.data().cost - totalSubMat;
    const totalMatSum = totalMatCost * matDoc.data().quantity;
    const totalSum = sumDoc.data().sumMaterials - totalMatSum;

    batch.update(matRef, { cost: totalMatCost });
    batch.update(sumRef, { sumMaterials: totalSum });
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
