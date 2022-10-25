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
import { IProjectLaborPlan } from '../types/projectLaborPlan';
import { IService } from '../types/service';
import { toastSuccess, toastError } from '../utils/toast';

export const getProjectLaborsPlan = async ({
  projectId,
  appStrings,
  successCallback,
  errorCallback,
}: { projectId: string } & IService) => {
  try {
    const userRef = collection(db, 'projects', projectId, 'projectLaborsPlan');
    const result = await getDocs(userRef);
    const data = result.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      subtotal: doc.data().cost * doc.data().quantity,
    })) as IProjectLaborPlan[];

    successCallback && successCallback(data);
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.getInformationError, errorMessage);

    errorCallback && errorCallback();
  }
};

export const getProjectLaborPlanById = async ({
  projectId,
  projectLaborPlanId,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  projectLaborPlanId: string;
} & IService) => {
  try {
    const userRef = doc(
      db,
      'projects',
      projectId,
      'projectLaborsPlan',
      projectLaborPlanId,
    );
    const result = await getDoc(userRef);
    const data = {
      ...result.data(),
      id: result.id,
      subtotal: result.data()?.cost * result.data()?.quantity,
    } as IProjectLaborPlan;

    successCallback && successCallback(data);
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.getInformationError, errorMessage);

    errorCallback && errorCallback();
  }
};

export const createProjectLaborPlan = async ({
  projectId,
  projectLaborPlan,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  projectLaborPlan: IProjectLaborPlan;
} & IService) => {
  try {
    const { id, subtotal, ...rest } = projectLaborPlan;
    const userRef = collection(db, 'projects', projectId, 'projectLaborsPlan');
    const result = await addDoc(userRef, rest);
    const data = {
      ...projectLaborPlan,
      id: result.id,
    } as IProjectLaborPlan;

    toastSuccess(appStrings.success, appStrings.saveSuccess);

    successCallback && successCallback(data);
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.saveError, errorMessage);

    errorCallback && errorCallback();
  }
};

export const updateProjectLaborPlan = async ({
  projectId,
  projectLaborPlan,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  projectLaborPlan: IProjectLaborPlan;
} & IService) => {
  try {
    const { id, subtotal, ...rest } = projectLaborPlan;
    const userRef = doc(db, 'projects', projectId, 'projectLaborsPlan', id);
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