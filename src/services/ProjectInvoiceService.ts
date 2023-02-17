import {
  collection,
  addDoc,
  getDocs,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  query,
  updateDoc,
  orderBy,
} from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from 'firebase/storage';
import { db, storage } from '../config/firebaseConfig';
import {
  IInvoiceProduct,
  IProjectInvoiceDetail,
} from '../types/projectInvoiceDetail';
import { IService } from '../types/service';
import { toastSuccess, toastError } from '../utils/toast';

export const getProjectInvoicing = async ({
  projectId,
  appStrings,
  successCallback,
  errorCallback,
}: { projectId: string } & IService) => {
  try {
    const invRef = collection(db, 'projects', projectId, 'projectInvoicing');
    const result = await getDocs(query(invRef, orderBy('order', 'desc')));
    const invoices = result.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      date: doc.data()?.date.toDate(),
    })) as IProjectInvoiceDetail[];

    let allInvoices: IProjectInvoiceDetail[] = [];
    let productsPromise = invoices.map(async elem => {
      const productQ = query(collection(invRef, elem.id, 'products'));
      const products = await getDocs(productQ);
      const data = products.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      })) as IInvoiceProduct[];
      return { ...elem, products: data };
    });
    await Promise.all(productsPromise).then(resul => {
      allInvoices = resul;
    });

    successCallback && successCallback(allInvoices);
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
    let data = {
      ...result.data(),
      id: result.id,
      date: result.data()?.date.toDate(),
    } as IProjectInvoiceDetail;

    const productQ = collection(invRef, 'products');
    const productsDocs = await getDocs(productQ);
    const products = productsDocs.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
    })) as IInvoiceProduct[];

    data = { ...data, products };

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
    const { id, pdfURL, pdfFile, products, ...rest } = projectInvoiceDetail;
    const invRef = collection(db, 'projects', projectId, 'projectInvoicing');

    const result = await addDoc(invRef, rest);
    let data = {
      ...projectInvoiceDetail,
      id: result.id,
    } as IProjectInvoiceDetail;

    if (pdfFile) {
      const storageRef = ref(storage, `invoices-pdf/${result.id}`);
      await uploadBytes(storageRef, pdfFile);
      data.pdfURL = await getDownloadURL(storageRef);
      await updateDoc(doc(invRef, data.id), { pdfURL: data.pdfURL });
    }

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
    const { id, pdfFile, products, ...rest } = projectInvoiceDetail;
    const invRef = doc(db, 'projects', projectId, 'projectInvoicing', id);

    if (pdfFile) {
      const storageRef = ref(storage, `invoices-pdf/${id}`);
      await uploadBytes(storageRef, pdfFile);
      const pdfURL = await getDownloadURL(storageRef);
      projectInvoiceDetail.pdfURL = pdfURL;
      await setDoc(invRef, { ...rest, pdfURL });
    } else {
      await setDoc(invRef, rest);
    }

    toastSuccess(appStrings.success, appStrings.saveSuccess);

    successCallback && successCallback(projectInvoiceDetail);
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.saveError, errorMessage);

    errorCallback && errorCallback();
  }
};

export const deleteProjectInvoiceDetail = async ({
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

    if (result.data()?.pdfURL) {
      const storageRef = ref(storage, `invoices-pdf/${result.id}`);
      await deleteObject(storageRef);
    }

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

export const addInvoiceProduct = async ({
  projectId,
  invoiceId,
  product,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  invoiceId: string;
  product: IInvoiceProduct;
} & IService) => {
  try {
    const { id, ...rest } = product;
    const productRef = collection(
      db,
      'projects',
      projectId,
      'projectInvoicing',
      invoiceId,
      'products',
    );
    const docRef = await addDoc(productRef, {
      ...rest,
    });
    const data = {
      ...rest,
      id: docRef.id,
    };

    toastSuccess(appStrings.success, appStrings.saveSuccess);

    successCallback && successCallback(invoiceId, data);
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.saveError, errorMessage);

    errorCallback && errorCallback();
  }
};

export const updateInvoiceProduct = async ({
  projectId,
  invoiceId,
  product,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  invoiceId: string;
  product: IInvoiceProduct;
} & IService) => {
  try {
    const { id, ...rest } = product;
    const matRef = doc(
      db,
      'projects',
      projectId,
      'projectInvoicing',
      invoiceId,
      'products',
      id,
    );
    await setDoc(matRef, rest);

    toastSuccess(appStrings.success, appStrings.saveSuccess);

    successCallback && successCallback(invoiceId, product);
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.saveError, errorMessage);

    errorCallback && errorCallback();
  }
};

export const deleteInvoiceProduct = async ({
  projectId,
  projectInvoiceId,
  invoiceProductId,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  projectInvoiceId: string;
  invoiceProductId: string;
} & IService) => {
  try {
    const matRef = doc(
      db,
      'projects',
      projectId,
      'projectInvoicing',
      projectInvoiceId,
      'products',
      invoiceProductId,
    );
    await deleteDoc(matRef);

    toastSuccess(appStrings.success, appStrings.deleteSuccess);

    successCallback && successCallback();
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.deleteError, errorMessage);

    errorCallback && errorCallback();
  }
};
