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
import { IProjectInvoiceDetail } from '../types/projectInvoiceDetail';
import { IService } from '../types/service';
import { toastSuccess, toastError } from '../utils/toast';

export const getProjectInvoicing = async ({
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
      // 'projectMaterialsDelivered',
      'projectInvoicing',
    );
    const result = await getDocs(userRef);
    const data = result.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      subtotal: doc.data().cost * doc.data().quantity,
      difference: doc.data().quantity - doc.data().delivered,
    })) as IProjectInvoiceDetail[];

    successCallback && successCallback(data);
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.getInformationError, errorMessage);

    errorCallback && errorCallback();
  }
};

export const getProjectInvoiceDetailById = async ({
  projectId,
  projectInvoiceDetailId,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  projectInvoiceDetailId: string;
} & IService) => {
  try {
    const userRef = doc(
      db,
      'projects',
      projectId,
      'projectInvoicing',
      projectInvoiceDetailId,
    );
    const result = await getDoc(userRef);
    const data = {
      ...result.data(),
      id: result.id,
      subtotal: result.data()?.cost * result.data()?.quantity,
    } as IProjectInvoiceDetail;

    successCallback && successCallback(data);
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.getInformationError, errorMessage);

    errorCallback && errorCallback();
  }
};

export const createProjectInvoiceDetail = async ({
  projectId,
  projectInvoiceDetail,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  projectInvoiceDetail: IProjectInvoiceDetail;
} & IService) => {
  try {
    const { id, subtotal, difference, ...rest } = projectInvoiceDetail;
    const userRef = collection(db, 'projects', projectId, 'projectInvoicing');
    const result = await addDoc(userRef, rest);
    const data = {
      ...projectInvoiceDetail,
      id: result.id,
    } as IProjectInvoiceDetail;

    toastSuccess(appStrings.success, appStrings.saveSuccess);

    successCallback && successCallback(data);
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.saveError, errorMessage);

    errorCallback && errorCallback();
  }
};

export const updateProjectInvoiceDetail = async ({
  projectId,
  projectInvoiceDetail,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  projectInvoiceDetail: IProjectInvoiceDetail;
} & IService) => {
  try {
    const { id, subtotal, difference, ...rest } = projectInvoiceDetail;
    const userRef = doc(db, 'projects', projectId, 'projectInvoicing', id);
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
