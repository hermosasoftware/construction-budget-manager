import {
  getDoc,
  doc,
  updateDoc,
  writeBatch,
  collection,
  setDoc,
} from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { db } from '../config/firebaseConfig';
import { IProjectBudget } from '../types/projectBudget';
import { IService } from '../types/service';
import { toastSuccess, toastError } from '../utils/toast';
import { getBudgetMaterials } from './BudgetMaterialsService';
import { IMaterialBreakdown } from '../types/collections';
import { getBudgetLabors } from './BudgetLaborsService';
import { IBudgetLabor } from '../types/budgetLabor';
import { getBudgetSubcontracts } from './BudgetSubcontractsService';
import { IBudgetSubcontract } from '../types/budgetSubcontract';
import { getProjectBudget } from './ProjectBudgetService';

export const getProjectExtraBudget = async ({
  projectId,
  appStrings,
  successCallback,
  errorCallback,
}: { projectId: string } & IService) => {
  try {
    const userRef = doc(
      db,
      'projects',
      projectId,
      'projectExtraBudget',
      'summary',
    );
    const result = await getDoc(userRef);
    const data = result.data() as IProjectBudget;

    successCallback && successCallback(data);
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.getInformationError, errorMessage);

    errorCallback && errorCallback();
  }
};

export const updateProjectExtraBudgetExchange = async ({
  projectId,
  exchange,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  exchange: number;
} & IService) => {
  try {
    const extraBudgetRef = doc(
      db,
      'projects',
      projectId,
      'projectExtraBudget',
      'summary',
    );
    await updateDoc(extraBudgetRef, { exchange });

    toastSuccess(appStrings.success, appStrings.saveSuccess);

    successCallback && successCallback();
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.saveError, errorMessage);

    errorCallback && errorCallback();
  }
};

export const copyBudgetToExtraBudget = async ({
  projectId,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
} & IService) => {
  try {
    await copyProjectBudget({ projectId, appStrings });
    await copyMaterials({ projectId, appStrings });
    await copyLabors({ projectId, appStrings });
    await copySubcontracts({ projectId, appStrings });

    toastSuccess(appStrings.success, appStrings.saveSuccess);

    successCallback && successCallback();
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.saveError, errorMessage);

    errorCallback && errorCallback();
  }
};

const copyProjectBudget = async ({
  projectId,
  appStrings,
}: {
  projectId: string;
} & IService) => {
  await getProjectBudget({
    projectId,
    appStrings,
    successCallback: async (projectBudget: IProjectBudget) => {
      const budgetRef = doc(
        db,
        'projects',
        projectId,
        'projectExtraBudget',
        'summary',
      );
      await setDoc(budgetRef, projectBudget);
    },
  });
};

const copyMaterials = async ({
  projectId,
  appStrings,
}: {
  projectId: string;
} & IService) => {
  await getBudgetMaterials({
    projectId,
    appStrings,
    successCallback: async (materialsBreakdown: IMaterialBreakdown[]) => {
      let batch = writeBatch(db); // write batch only allows maximum 500 writes per batch
      const destCollection = collection(
        db,
        'projects',
        projectId,
        'projectExtraBudget',
        'summary',
        'budgetMaterials',
      );
      let i = 0;
      for (const materialBreakdown of materialsBreakdown) {
        const { id: materialId, ...materialRest } = materialBreakdown.material;
        batch.set(doc(destCollection, materialId), materialRest);
        i++;
        if (i > 400) {
          i = 0;
          await batch.commit();
          batch = writeBatch(db);
        }
        for (const {
          id: subMaterialId,
          ...subMaterial
        } of materialBreakdown.subMaterials) {
          batch.set(
            doc(
              collection(doc(destCollection, materialId), 'subMaterials'),
              subMaterialId,
            ),
            subMaterial,
          );
          i++;
          if (i > 400) {
            i = 0;
            await batch.commit();
            batch = writeBatch(db);
          }
        }
      }
      if (i > 0) await batch.commit();
    },
  });
};

const copyLabors = async ({
  projectId,
  appStrings,
}: {
  projectId: string;
} & IService) => {
  await getBudgetLabors({
    projectId,
    appStrings,
    successCallback: async (labors: IBudgetLabor[]) => {
      let batch = writeBatch(db);
      const destCollection = collection(
        db,
        'projects',
        projectId,
        'projectExtraBudget',
        'summary',
        'budgetLabors',
      );
      let i = 0;
      for (const { id, ...labor } of labors) {
        batch.set(doc(destCollection, id), labor);
        i++;
        if (i > 400) {
          i = 0;
          await batch.commit();
          batch = writeBatch(db);
        }
      }
      if (i > 0) await batch.commit();
    },
  });
};

const copySubcontracts = async ({
  projectId,
  appStrings,
}: {
  projectId: string;
} & IService) => {
  await getBudgetSubcontracts({
    projectId,
    appStrings,
    successCallback: async (subcontracts: IBudgetSubcontract[]) => {
      let batch = writeBatch(db);
      const destCollection = collection(
        db,
        'projects',
        projectId,
        'projectExtraBudget',
        'summary',
        'budgetSubcontracts',
      );
      let i = 0;
      for (const { id, ...subcontract } of subcontracts) {
        batch.set(doc(destCollection, id), subcontract);
        i++;
        if (i > 400) {
          i = 0;
          await batch.commit();
          batch = writeBatch(db);
        }
      }
      if (i > 0) await batch.commit();
    },
  });
};
