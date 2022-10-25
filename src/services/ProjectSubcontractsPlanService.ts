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
import { IProjectSubcontractPlan } from '../types/projectSubcontractPlan';
import { IService } from '../types/service';
import { toastSuccess, toastError } from '../utils/toast';

export const getProjectSubcontractsPlan = async ({
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
      'projectSubcontractsPlan',
    );
    const result = await getDocs(userRef);
    const data = result.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      subtotal: doc.data().cost * doc.data().quantity,
    })) as IProjectSubcontractPlan[];

    successCallback && successCallback(data);
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.getInformationError, errorMessage);

    errorCallback && errorCallback();
  }
};

export const getProjectSubcontractPlanById = async ({
  projectId,
  projectSubcontractPlanId,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  projectSubcontractPlanId: string;
} & IService) => {
  try {
    const userRef = doc(
      db,
      'projects',
      projectId,
      'projectSubcontractsPlan',
      projectSubcontractPlanId,
    );
    const result = await getDoc(userRef);
    const data = {
      ...result.data(),
      id: result.id,
      subtotal: result.data()?.cost * result.data()?.quantity,
    } as IProjectSubcontractPlan;

    successCallback && successCallback(data);
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.getInformationError, errorMessage);

    errorCallback && errorCallback();
  }
};

export const createProjectSubcontractPlan = async ({
  projectId,
  projectSubcontractPlan,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  projectSubcontractPlan: IProjectSubcontractPlan;
} & IService) => {
  try {
    const { id, subtotal, ...rest } = projectSubcontractPlan;
    const userRef = collection(
      db,
      'projects',
      projectId,
      'projectSubcontractsPlan',
    );
    const result = await addDoc(userRef, rest);
    const data = {
      ...projectSubcontractPlan,
      id: result.id,
    } as IProjectSubcontractPlan;

    toastSuccess(appStrings.success, appStrings.saveSuccess);

    successCallback && successCallback(data);
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.saveError, errorMessage);

    errorCallback && errorCallback();
  }
};

export const updateProjectSubcontractPlan = async ({
  projectId,
  projectSubcontractPlan,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  projectSubcontractPlan: IProjectSubcontractPlan;
} & IService) => {
  try {
    const { id, subtotal, ...rest } = projectSubcontractPlan;
    const userRef = doc(
      db,
      'projects',
      projectId,
      'projectSubcontractsPlan',
      id,
    );
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
