import {
  collection,
  addDoc,
  getDocs,
  doc,
  setDoc,
  getDoc,
} from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { db } from '../config/firebaseConfig';
import { IProjectMaterialDelivered } from '../types/projectMaterialDelivered';
import { IService } from '../types/service';

export const getProjectMaterialsDelivered = async ({
  projectId,
  toast,
  appStrings,
  successCallback,
  errorCallback,
}: { projectId: string } & IService): Promise<IProjectMaterialDelivered[]> => {
  try {
    const userRef = collection(
      db,
      'projects',
      projectId,
      'projectMaterialsDelivered',
    );
    const result = await getDocs(userRef);
    const data = result.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      subtotal: doc.data().cost * doc.data().quantity,
      difference: doc.data().quantity - doc.data().delivered,
    })) as IProjectMaterialDelivered[];

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

export const getProjectMaterialDeliveredById = async ({
  projectId,
  projectMaterialDeliveredId,
  toast,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  projectMaterialDeliveredId: string;
} & IService): Promise<IProjectMaterialDelivered | null> => {
  try {
    const userRef = doc(
      db,
      'projects',
      projectId,
      'projectMaterialsDelivered',
      projectMaterialDeliveredId,
    );
    const result = await getDoc(userRef);
    const data = {
      ...result.data(),
      id: result.id,
      subtotal: result.data()?.cost * result.data()?.quantity,
    } as IProjectMaterialDelivered;

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

export const createProjectMaterialDelivered = async ({
  projectId,
  projectMaterialDelivered,
  toast,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  projectMaterialDelivered: IProjectMaterialDelivered;
} & IService): Promise<IProjectMaterialDelivered | null> => {
  try {
    const { id, subtotal, difference, ...rest } = projectMaterialDelivered;
    const userRef = collection(
      db,
      'projects',
      projectId,
      'projectMaterialsDelivered',
    );
    const result = await addDoc(userRef, rest);
    const data = {
      ...projectMaterialDelivered,
      id: result.id,
    } as IProjectMaterialDelivered;

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

export const updateProjectMaterialDelivered = async ({
  projectId,
  projectMaterialDelivered,
  toast,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  projectMaterialDelivered: IProjectMaterialDelivered;
} & IService) => {
  try {
    const { id, subtotal, difference, ...rest } = projectMaterialDelivered;
    const userRef = doc(
      db,
      'projects',
      projectId,
      'projectMaterialsDelivered',
      id,
    );
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
