import { getDoc, doc } from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { db } from '../config/firebaseConfig';
import { IProjectExtraBudget } from '../types/projectExtraBudget';
import { IService } from '../types/service';
import { toastError } from '../utils/toast';

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
    const data = {
      ...result.data(),
      creationDate: result.data()?.creationDate.toDate(),
    } as IProjectExtraBudget;

    successCallback && successCallback(data);
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.getInformationError, errorMessage);

    errorCallback && errorCallback();
  }
};
