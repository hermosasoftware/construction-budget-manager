import {
  collection,
  addDoc,
  getDocs,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { db } from '../config/firebaseConfig';
import { IProjectInvoiceDetail } from '../types/projectInvoiceDetail';
import { IService } from '../types/service';
import { toastSuccess, toastError } from '../utils/toast';
import { get, omit } from 'lodash';

export const getProjectInvoicing = async ({
  projectId,
  appStrings,
  successCallback,
  errorCallback,
}: { projectId: string } & IService) => {
  try {
    const invRef = collection(
      db,
      'projects',
      projectId,
      // 'projectMaterialsDelivered',
      'projectInvoicing',
    );
    const result = await getDocs(invRef);
    const data = result.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      date: doc.data()?.date.toDate(),
      // subtotal: doc.data().cost * doc.data().quantity,
      // difference: doc.data().quantity - doc.data().delivered,
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
    const invRef = doc(
      db,
      'projects',
      projectId,
      'projectInvoicing',
      projectInvoiceDetailId,
    );
    const result = await getDoc(invRef);
    const data = {
      ...result.data(),
      id: result.id,
      date: result.data()?.date.toDate(),
    } as IProjectInvoiceDetail;

    successCallback && successCallback(data);
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.getInformationError, errorMessage);

    errorCallback && errorCallback();
  }
};

export const getProjectInvoiceProductsById = async ({
  projectId,
  projectInvoiceId,
  appStrings,
  successCallback,
  errorCallback,
}: { projectId: string; projectInvoiceId: string } & IService) => {
  try {
    const invRef = collection(
      db,
      'projects',
      projectId,
      'projectInvoicing',
      projectInvoiceId,
      'products',
    );
    const result = await getDocs(invRef);
    const data = result.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
    }));

    successCallback && successCallback(data);
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.saveError, errorMessage);

    errorCallback && errorCallback();
  }
};

export const updateProjectInvoiceProductsById = async ({
  projectId,
  projectInvoiceId,
  deliveredMaterial,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  projectInvoiceId: string;
  deliveredMaterial: any;
} & IService) => {
  try {
    let batch = writeBatch(db); // write batch only allows maximum 500 writes per batch
    const destCollection = collection(
      db,
      'projects',
      projectId,
      'projectInvoicing',
      projectInvoiceId,
      'products',
    );
    const allUpdatedInvoicesRef: any[] = [];
    Object.keys(deliveredMaterial).forEach((productId: any) => {
      const quantity = deliveredMaterial[productId];
      const ref = doc(destCollection, productId);
      allUpdatedInvoicesRef.push(ref);
      batch.update(ref, { delivered: quantity });
    });
    await batch.commit();

    const allUpdatedInvoices: any = allUpdatedInvoicesRef.map(
      async e => await getDoc(e),
    );
    let data: IProjectInvoiceDetail[] = [];
    await Promise.all(allUpdatedInvoices).then(response => {
      data = response.map(e => e.data());
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

export const createProjectInvoice = async ({
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
    const { id, ...rest } = projectInvoiceDetail;
    const products = get(rest, 'products', []);
    let toSave = omit(rest, ['option', 'products']);
    const invRef = collection(db, 'projects', projectId, 'projectInvoicing');
    const result = await addDoc(invRef, toSave);

    let batch = writeBatch(db); // write batch only allows maximum 500 writes per batch
    const destCollection = collection(
      db,
      'projects',
      projectId,
      'projectInvoicing',
      result.id,
      'products',
    );
    products.forEach((product: any) => {
      const { id, ...p } = product;
      batch.set(doc(destCollection, id), { ...p, delivered: 0 });
    });
    await batch.commit();
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

export const updateProjectInvoice = async ({
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
    const { id, ...rest } = projectInvoiceDetail;
    const invRef = doc(db, 'projects', projectId, 'projectInvoicing', id);
    await setDoc(invRef, rest);

    toastSuccess(appStrings.success, appStrings.saveSuccess);

    successCallback && successCallback(projectInvoiceDetail);
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.saveError, errorMessage);

    errorCallback && errorCallback();
  }
};

export const deleteProjectInvoice = async ({
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
    const invRef = doc(
      db,
      'projects',
      projectId,
      'projectInvoicing',
      projectInvoiceDetailId,
    );
    await deleteDoc(invRef);

    toastSuccess(appStrings.success, appStrings.deleteSuccess);

    successCallback && successCallback();
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.deleteError, errorMessage);

    errorCallback && errorCallback();
  }
};
