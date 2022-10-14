import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  setDoc,
} from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { db } from '../config/firebaseConfig';
import { IProjectMaterialPlan } from '../types/projectMaterialPlan';
import { IService } from '../types/service';

export const getProjectMaterialsPlan = async ({
  projectId,
  toast,
  appStrings,
  successCallback,
  errorCallback,
}: { projectId: string } & IService): Promise<IProjectMaterialPlan[]> => {
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

    successCallback && successCallback();
    return data;
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toast({
      title: appStrings.getInformationError,
      description: errorMessage,
      status: 'error',
      duration: 5000,
      isClosable: true,
      position: 'top-right',
    });

    errorCallback && errorCallback();
    return [];
  }
};

export const getProjectMaterialPlanById = async ({
  projectId,
  projectMaterialPlanId,
  toast,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  projectMaterialPlanId: string;
} & IService): Promise<IProjectMaterialPlan | null> => {
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

    successCallback && successCallback();
    return data;
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toast({
      title: appStrings.getInformationError,
      description: errorMessage,
      status: 'error',
      duration: 5000,
      isClosable: true,
      position: 'top-right',
    });

    errorCallback && errorCallback();
    return null;
  }
};

export const createProjectMaterialPlan = async ({
  projectId,
  projectMaterialPlan,
  toast,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  projectMaterialPlan: IProjectMaterialPlan;
} & IService): Promise<IProjectMaterialPlan | null> => {
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

    toast({
      title: appStrings.success,
      description: appStrings.saveSuccess,
      status: 'success',
      duration: 3000,
      isClosable: true,
      position: 'top-right',
    });

    successCallback && successCallback();
    return data;
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toast({
      title: appStrings.saveError,
      description: errorMessage,
      status: 'error',
      duration: 5000,
      isClosable: true,
      position: 'top-right',
    });

    errorCallback && errorCallback();
    return null;
  }
};

export const updateProjectMaterialPlan = async ({
  projectId,
  projectMaterialPlan,
  toast,
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

    toast({
      title: appStrings.success,
      description: appStrings.saveSuccess,
      status: 'success',
      duration: 3000,
      isClosable: true,
      position: 'top-right',
    });

    successCallback && successCallback();
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toast({
      title: appStrings.saveError,
      description: errorMessage,
      status: 'error',
      duration: 5000,
      isClosable: true,
      position: 'top-right',
    });

    errorCallback && errorCallback();
  }
};
