import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  setDoc,
  query,
} from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { db } from '../config/firebaseConfig';
import { IProjectMaterialPlan } from '../types/projectMaterialPlan';
import { IService } from '../types/service';
import { toastSuccess, toastError } from '../utils/toast';

export const getProjectMaterialsPlan = async ({
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
    })) as IProjectMaterialPlan[];

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

export const getProjectMaterialPlanById = async ({
  projectId,
  projectMaterialPlanId,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  projectMaterialPlanId: string;
} & IService) => {
  try {
    const userRef = doc(
      db,
      'projects',
      projectId,
      'projectMaterialsPlan',
      projectMaterialPlanId,
    );
    const result = await getDoc(userRef);
    const data = {
      ...result.data(),
      id: result.id,
      subtotal: result.data()?.cost * result.data()?.quantity,
    } as IProjectMaterialPlan;

    successCallback && successCallback(data);
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.getInformationError, errorMessage);

    errorCallback && errorCallback();
  }
};

export const createProjectMaterialPlan = async ({
  projectId,
  projectMaterialPlan,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  projectMaterialPlan: IProjectMaterialPlan;
} & IService) => {
  try {
    const { id, subtotal, ...rest } = projectMaterialPlan;
    const userRef = collection(
      db,
      'projects',
      projectId,
      'projectMaterialsPlan',
    );
    const result = await addDoc(userRef, rest);
    const data = {
      ...projectMaterialPlan,
      id: result.id,
    } as IProjectMaterialPlan;

    toastSuccess(appStrings.success, appStrings.saveSuccess);

    successCallback && successCallback(data);
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.saveError, errorMessage);

    errorCallback && errorCallback();
  }
};

export const updateProjectMaterialPlan = async ({
  projectId,
  projectMaterialPlan,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  projectMaterialPlan: IProjectMaterialPlan;
} & IService) => {
  try {
    const { id, subtotal, ...rest } = projectMaterialPlan;
    const userRef = doc(db, 'projects', projectId, 'projectMaterialsPlan', id);
    await setDoc(userRef, rest);

    toastSuccess(appStrings.success, appStrings.saveSuccess);

    successCallback && successCallback();
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.saveError, errorMessage);

    errorCallback && errorCallback();
  }
};
