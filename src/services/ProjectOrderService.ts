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
  onSnapshot,
  FirestoreError,
  writeBatch,
  updateDoc,
} from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { db } from '../config/firebaseConfig';
import { IOrderProduct, IProjectOrder } from '../types/projectOrder';
import { IService } from '../types/service';
import { toastSuccess, toastError } from '../utils/toast';
import { deleteCollect, listenersList } from './herperService';
import { store } from '../redux/store';
import {
  changeProjectOrders,
  insertProjectOrder,
  modifyProjectOrder,
  removeProjectOrder,
} from '../redux/reducers/projectOrdersSlice';

export const listenProjectOrders = ({
  projectId,
  appStrings,
  successCallback,
  errorCallback,
}: { projectId: string } & IService) => {
  try {
    const orderRef = collection(db, 'projects', projectId, 'projectOrders');
    const OrdersQuery = query(orderRef, orderBy('order', 'desc'));
    const { dispatch, getState } = store;

    const unsubscribe = onSnapshot(
      OrdersQuery,
      { includeMetadataChanges: true },
      querySnapshot => {
        let ordersList = [...getState().projectOrders.projectOrders];

        const projectOrders: any = querySnapshot
          .docChanges({ includeMetadataChanges: true })
          .map(async change => {
            const elem = {
              ...change.doc.data(),
              id: change.doc.id,
              date: change.doc.data().date.toDate().toISOString(),
              deliverDate: change.doc.data().deliverDate.toDate().toISOString(),
            } as IProjectOrder;

            if (change.type === 'added') {
              return changeTypeAdded(dispatch, ordersList, orderRef, elem);
            }
            if (change.type === 'modified') {
              return changeTypeModified(dispatch, orderRef, elem);
            }
            if (change.type === 'removed') {
              return changeTypeRemoved(dispatch, elem);
            }
          });

        Promise.all(projectOrders).then(result => {
          result.flat().length && dispatch(changeProjectOrders(result));
        });
      },
      error => {
        const index = listenersList.findIndex(e => e.name === 'projectOrders');
        if (index !== -1) {
          listenersList.splice(index, 1);
          dispatch(changeProjectOrders([]));
        }
        throw error;
      },
    );
    successCallback && successCallback(unsubscribe);
  } catch (e) {
    let errorMessage = appStrings.genericError;
    if (e instanceof FirebaseError || e instanceof FirestoreError) {
      errorMessage = e.message;
    }
    toastError(appStrings.getInformationError, errorMessage);
    errorCallback && errorCallback();
  }
};

const changeTypeAdded = async (
  dispatch: any,
  ordersList: IProjectOrder[],
  orderRef: any,
  elem: IProjectOrder,
) => {
  const productQ = query(collection(orderRef, elem.id, 'products'));
  const products = await getDocs(productQ);
  const data = products.docs.map(doc => ({
    ...doc.data(),
    id: doc.id,
  })) as IOrderProduct[];

  if (ordersList.length > 0) {
    dispatch(
      insertProjectOrder({
        ...elem,
        products: data,
      }),
    );
    return [];
  } else {
    return {
      ...elem,
      products: data,
    };
  }
};

const changeTypeModified = async (
  dispatch: any,
  orderRef: any,
  elem: IProjectOrder,
) => {
  const productQ = query(collection(orderRef, elem.id, 'products'));
  const products = await getDocs(productQ);
  const data = products.docs.map(doc => ({
    ...doc.data(),
    id: doc.id,
  })) as IOrderProduct[];
  dispatch(
    modifyProjectOrder({
      ...elem,
      products: data,
    }),
  );
  return [];
};

const changeTypeRemoved = async (dispatch: any, elem: IProjectOrder) => {
  dispatch(
    removeProjectOrder({
      ...elem,
      products: [],
    }),
  );
  return [];
};

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
      deliverDate: doc.data()?.deliverDate?.toDate(),
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
      deliverDate: result.data()?.deliverDate?.toDate(),
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
    await deleteCollect(`${orderRef.path}/products`);
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
    const orderRef = doc(db, 'projects', projectId, 'projectOrders', orderId);
    const productRef = collection(
      db,
      'projects',
      projectId,
      'projectOrders',
      orderId,
      'products',
    );

    const docRef = await addDoc(productRef, {
      ...rest,
    });
    const data = {
      ...rest,
      id: docRef.id,
    };
    await updateDoc(orderRef, {});

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
    const orderRef = doc(db, 'projects', projectId, 'projectOrders', orderId);
    const productRef = doc(
      db,
      'projects',
      projectId,
      'projectOrders',
      orderId,
      'products',
      id,
    );

    await setDoc(productRef, rest);
    await updateDoc(orderRef, {});

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
    const orderRef = doc(
      db,
      'projects',
      projectId,
      'projectOrders',
      projectOrderId,
    );
    const productRef = doc(collection(orderRef, 'products'), orderProductId);
    const batch = writeBatch(db);

    batch.delete(productRef);
    batch.update(orderRef, {});

    await batch.commit();

    toastSuccess(appStrings.success, appStrings.deleteSuccess);

    successCallback && successCallback();
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.deleteError, errorMessage);

    errorCallback && errorCallback();
  }
};
