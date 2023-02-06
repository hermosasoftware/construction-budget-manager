import {
  collection,
  addDoc,
  getDocs,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { db } from '../config/firebaseConfig';
import { IOrderProduct, IProjectOrder } from '../types/projectOrder';
import { IService } from '../types/service';
import { toastSuccess, toastError } from '../utils/toast';

export const getProjectOrders = async ({
  projectId,
  appStrings,
  successCallback,
  errorCallback,
}: { projectId: string } & IService) => {
  try {
    const orderRef = collection(db, 'projects', projectId, 'projectOrders');
    const result = await getDocs(query(orderRef, orderBy('order', 'desc')));
    const orders = result.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      date: doc.data()?.date?.toDate(),
    })) as IProjectOrder[];

    let allOrders: IProjectOrder[] = [];
    let productsPromise = orders.map(async elem => {
      const productQ = query(collection(orderRef, elem.id, 'products'));
      const products = await getDocs(productQ);
      const data = products.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      })) as IOrderProduct[];
      return { ...elem, products: data };
    });
    await Promise.all(productsPromise).then(resul => {
      allOrders = resul;
    });

    successCallback && successCallback(allOrders);
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.getInformationError, errorMessage);

    errorCallback && errorCallback();
  }
};

export const getProjectOrderById = async ({
  projectId,
  projectOrderId,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  projectOrderId: string;
} & IService) => {
  try {
    const orderRef = doc(
      db,
      'projects',
      projectId,
      'projectOrders',
      projectOrderId,
    );
    const result = await getDoc(orderRef);
    let data = {
      ...result.data(),
      id: result.id,
      date: result.data()?.date?.toDate(),
    } as IProjectOrder;

    const productQ = collection(orderRef, 'products');
    const productsDocs = await getDocs(productQ);
    const products = productsDocs.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
    })) as IOrderProduct[];

    data = { ...data, products };

    successCallback && successCallback(data);
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.getInformationError, errorMessage);

    errorCallback && errorCallback();
  }
};

export const createProjectOrder = async ({
  projectId,
  projectOrder,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  projectOrder: IProjectOrder;
} & IService) => {
  try {
    const { id, cost, products, ...rest } = projectOrder;
    const orderRef = collection(db, 'projects', projectId, 'projectOrders');
    const result = await addDoc(orderRef, rest);
    const data = {
      ...projectOrder,
      id: result.id,
    } as IProjectOrder;

    toastSuccess(appStrings.success, appStrings.saveSuccess);

    successCallback && successCallback(data);
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.saveError, errorMessage);

    errorCallback && errorCallback();
  }
};

export const updateProjectOrder = async ({
  projectId,
  projectOrder,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  projectOrder: IProjectOrder;
} & IService) => {
  try {
    const { id, cost, products, ...rest } = projectOrder;
    const orderRef = doc(db, 'projects', projectId, 'projectOrders', id);
    await setDoc(orderRef, rest);

    toastSuccess(appStrings.success, appStrings.saveSuccess);

    successCallback && successCallback(projectOrder);
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.saveError, errorMessage);

    errorCallback && errorCallback();
  }
};

export const deleteProjectOrder = async ({
  projectId,
  projectOrderId,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  projectOrderId: string;
} & IService) => {
  try {
    const orderRef = doc(
      db,
      'projects',
      projectId,
      'projectOrders',
      projectOrderId,
    );
    await deleteDoc(orderRef);

    toastSuccess(appStrings.success, appStrings.deleteSuccess);

    successCallback && successCallback();
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.deleteError, errorMessage);

    errorCallback && errorCallback();
  }
};

export const addOrderProduct = async ({
  projectId,
  orderId,
  product,
  materialRef,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  orderId: string;
  product: IOrderProduct;
  materialRef: {
    materialId: string;
    subMaterialId: string;
    isExtraMaterial: boolean;
    isSubMaterial: boolean;
  };
} & IService) => {
  try {
    const { id, ...rest } = product;
    const productRef = collection(
      db,
      'projects',
      projectId,
      'projectOrders',
      orderId,
      'products',
    );
    const matRef = doc(
      db,
      'projects',
      projectId,
      materialRef?.isExtraMaterial ? 'projectExtraBudget' : 'projectBudget',
      'summary',
      'budgetMaterials',
      materialRef?.isSubMaterial
        ? `${materialRef.materialId}/submaterials/${materialRef.subMaterialId}`
        : materialRef.materialId,
    );
    const docRef = await addDoc(productRef, {
      ...rest,
      materialRef: matRef.path,
    });
    const data = {
      ...rest,
      id: docRef.id,
      materialRef: matRef.path,
    };

    toastSuccess(appStrings.success, appStrings.saveSuccess);

    successCallback && successCallback(orderId, data);
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.saveError, errorMessage);

    errorCallback && errorCallback();
  }
};

export const updateOrderProduct = async ({
  projectId,
  orderId,
  product,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  orderId: string;
  product: IOrderProduct;
} & IService) => {
  try {
    const { id, ...rest } = product;
    const matRef = doc(
      db,
      'projects',
      projectId,
      'projectOrders',
      orderId,
      'products',
      id,
    );
    await setDoc(matRef, rest);

    toastSuccess(appStrings.success, appStrings.saveSuccess);

    successCallback && successCallback(orderId, product);
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.saveError, errorMessage);

    errorCallback && errorCallback();
  }
};

export const deleteOrderProduct = async ({
  projectId,
  projectOrderId,
  orderProductId,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  projectOrderId: string;
  orderProductId: string;
} & IService) => {
  try {
    const matRef = doc(
      db,
      'projects',
      projectId,
      'projectOrders',
      projectOrderId,
      'products',
      orderProductId,
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
