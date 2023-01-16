import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  runTransaction,
  writeBatch,
  setDoc,
  addDoc,
} from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { db } from '../config/firebaseConfig';
import { IBudgetMaterial } from '../types/budgetMaterial';
import { IService } from '../types/service';
import { toastSuccess, toastError } from '../utils/toast';
import { ISubMaterial } from '../types/collections';

export const getBudgetMaterials = async ({
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
      'projectBudget',
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
          'projectBudget',
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

export const getBudgetMaterialById = async ({
  projectId,
  activityId,
  budgetMaterialId,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  activityId: string;
  budgetMaterialId: string;
} & IService) => {
  try {
    const matRef = doc(
      db,
      'projects',
      projectId,
      'projectBudget',
      activityId,
      'budgetMaterials',
      budgetMaterialId,
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

export const createBudgetMaterial = async ({
  projectId,
  activityId,
  budgetMaterial,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  activityId: string;
  budgetMaterial: IBudgetMaterial;
} & IService) => {
  try {
    const data = await runTransaction(db, async transaction => {
      const { id, subtotal, ...rest } = budgetMaterial;
      const matRef = doc(
        collection(
          db,
          'projects',
          projectId,
          'projectBudget',
          activityId,
          'budgetMaterials',
        ),
      );
      const sumRef = doc(db, 'projects', projectId, 'projectBudget', 'summary');
      const sumDoc = await transaction.get(sumRef);

      if (!sumDoc.exists()) throw Error(appStrings.noRecords);

      const total = sumDoc.data().sumMaterials + subtotal;

      transaction.update(sumRef, { sumMaterials: total });
      transaction.set(matRef, rest);

      return {
        ...budgetMaterial,
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

export const updateBudgetMaterial = async ({
  projectId,
  activityId,
  budgetMaterial,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  activityId: string;
  budgetMaterial: IBudgetMaterial;
} & IService) => {
  try {
    await runTransaction(db, async transaction => {
      const { id, subtotal, ...rest } = budgetMaterial;
      const matRef = doc(
        db,
        'projects',
        projectId,
        'projectBudget',
        activityId,
        'budgetMaterials',
        id,
      );
      const sumRef = doc(db, 'projects', projectId, 'projectBudget', 'summary');
      const matDoc = await transaction.get(matRef);
      const sumDoc = await transaction.get(sumRef);

      if (!matDoc.exists() || !sumDoc.exists()) {
        throw Error(appStrings.noRecords);
      }

      const newSum = subtotal - matDoc.data().cost * matDoc.data().quantity;
      const total = sumDoc.data().sumMaterials + newSum;

      transaction.update(sumRef, { sumMaterials: total });
      transaction.set(matRef, rest);
    });

    toastSuccess(appStrings.success, appStrings.saveSuccess);

    successCallback && successCallback(budgetMaterial);
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.saveError, errorMessage);

    errorCallback && errorCallback();
  }
};

export const deleteBudgetMaterial = async ({
  projectId,
  activityId,
  budgetMaterialId,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  activityId: string;
  budgetMaterialId: string;
} & IService) => {
  try {
    const matRef = doc(
      db,
      'projects',
      projectId,
      'projectBudget',
      activityId,
      'budgetMaterials',
      budgetMaterialId,
    );
    const subMatRef = collection(matRef, 'subMaterials');
    const sumRef = doc(db, 'projects', projectId, 'projectBudget', 'summary');
    const sumDoc = await getDoc(sumRef);
    const matDoc = await getDoc(matRef);
    const subMatDocs = await getDocs(subMatRef);

    if (!matDoc.exists() || !sumDoc.exists()) throw Error(appStrings.noRecords);

    const batch = writeBatch(db);
    for (const subMaterial of subMatDocs.docs) {
      batch.delete(doc(subMatRef, subMaterial.id));
    }

    const newSum = matDoc.data().cost * matDoc.data().quantity;
    const total = sumDoc.data().sumMaterials - newSum;
    batch.update(sumRef, { sumMaterials: total });
    batch.delete(matRef);

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

export const createBudgetSubMaterial = async ({
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
      'projectBudget',
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

export const updateBudgetSubMaterial = async ({
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
      'projectBudget',
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

export const deleteBudgetSubMaterial = async ({
  projectId,
  activityId,
  budgetMaterialId,
  budgetSubMaterialId,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  activityId: string;
  budgetMaterialId: string;
  budgetSubMaterialId: string;
} & IService) => {
  try {
    const matRef = doc(
      db,
      'projects',
      projectId,
      'projectBudget',
      activityId,
      'budgetMaterials',
      budgetMaterialId,
    );
    const subMatRef = doc(
      collection(matRef, 'subMaterials'),
      budgetSubMaterialId,
    );
    const sumRef = doc(db, 'projects', projectId, 'projectBudget', 'summary');
    const sumDoc = await getDoc(sumRef);
    const matDoc = await getDoc(matRef);
    const subMatDoc = await getDoc(subMatRef);

    if (!matDoc.exists() || !sumDoc.exists() || !subMatDoc.exists()) {
      throw Error(appStrings.noRecords);
    }

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
