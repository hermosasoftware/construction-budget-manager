import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  runTransaction,
} from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { db } from '../config/firebaseConfig';
import { IBudgetMaterial } from '../types/budgetMaterial';
import { IService } from '../types/service';
import { toastSuccess, toastError } from '../utils/toast';

export const getBudgetMaterials = async ({
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
      'projectMaterialsPlan',
    );
    const result = await getDocs(userRef);
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
          'projectMaterialsPlan',
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
  budgetMaterialId,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  budgetMaterialId: string;
} & IService) => {
  try {
    const userRef = doc(
      db,
      'projects',
      projectId,
      'projectMaterialsPlan',
      budgetMaterialId,
    );
    const result = await getDoc(userRef);
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
  budgetMaterial,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  budgetMaterial: IBudgetMaterial;
} & IService) => {
  try {
    const data = await runTransaction(db, async transaction => {
      const { id, subtotal, ...rest } = budgetMaterial;
      const matRef = doc(
        collection(db, 'projects', projectId, 'projectMaterialsPlan'),
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
  budgetMaterial,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  budgetMaterial: IBudgetMaterial;
} & IService) => {
  try {
    await runTransaction(db, async transaction => {
      const { id, subtotal, ...rest } = budgetMaterial;
      const matRef = doc(db, 'projects', projectId, 'projectMaterialsPlan', id);
      const sumRef = doc(db, 'projects', projectId, 'projectBudget', 'summary');
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
