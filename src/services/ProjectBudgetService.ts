import { getDoc, doc, setDoc } from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { db } from '../config/firebaseConfig';
import { IProjectBudget } from '../types/projectBudget';
import { IService } from '../types/service';
import { toastSuccess, toastError } from '../utils/toast';

export const getProjectBudget = async ({
  projectId,
  appStrings,
  successCallback,
  errorCallback,
}: { projectId: string } & IService) => {
  try {
    const userRef = doc(db, 'projects', projectId, 'projectBudget', 'summary');
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

export const updateProjectBudget = async ({
  projectId,
  projectBudget,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  projectBudget: IProjectBudget;
} & IService) => {
  try {
    const userRef = doc(db, 'projects', projectId, 'projectBudget', 'summary');
    await setDoc(userRef, projectBudget);

    toastSuccess(appStrings.success, appStrings.saveSuccess);

    successCallback && successCallback();
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.saveError, errorMessage);

    errorCallback && errorCallback();
  }
};
