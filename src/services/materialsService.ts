import {
  addDoc,
  collection,
  doc,
  FirestoreError,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { db } from '../config/firebaseConfig';
import {
  IMaterial,
  IMaterialBreakdown,
  ISubMaterial,
} from '../types/collections';
import { IService } from '../types/service';
import { toastError, toastSuccess } from '../utils/toast';
import {
  changeMaterials,
  insertMaterial,
  modifyMaterial,
  removeMaterial,
} from '../redux/reducers/materialsSlice';
import { store } from '../redux/store';
import { listenersList } from './herperService';

const materialDocRef = collection(db, 'materials');

export const listenMaterials = async ({
  appStrings,
  successCallback,
  errorCallback,
}: IService) => {
  try {
    const materialsQuery = query(materialDocRef, orderBy('name'));
    const { dispatch, getState } = store;

    const unsubscribe = onSnapshot(
      materialsQuery,
      querySnapshot => {
        let materialsList = [...getState().materials.materials];

        const materials: any = querySnapshot.docChanges().map(async change => {
          const elem = {
            ...change.doc.data(),
            id: change.doc.id,
            createdAt: change.doc.data()?.createdAt?.toDate()?.toISOString(),
            updatedAt: change.doc.data()?.updatedAt?.toDate()?.toISOString(),
          } as IMaterial;

          if (change.type === 'added') {
            return changeTypeAdded(dispatch, materialsList, elem);
          }
          if (change.type === 'modified') {
            return changeTypeModified(dispatch, elem);
          }
          if (change.type === 'removed') {
            return changeTypeRemoved(dispatch, elem);
          }
        });

        Promise.all(materials).then(result => {
          result.flat().length && dispatch(changeMaterials(result));
        });
      },
      error => {
        const index = listenersList.findIndex(e => e.name === 'materials');
        if (index !== -1) {
          listenersList.splice(index, 1);
          dispatch(changeMaterials([]));
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
  materialsList: IMaterialBreakdown[],
  elem: IMaterial,
) => {
  const materialQ = query(
    collection(db, 'materials', elem.id, 'subMaterials'),
    orderBy('createdAt'),
  );
  const subMaterials = await getDocs(materialQ);
  const data = subMaterials.docs.map(doc => ({
    ...doc.data(),
    id: doc.id,
    createdAt: doc.data()?.createdAt?.toDate()?.toISOString(),
    updatedAt: doc.data()?.updatedAt?.toDate()?.toISOString(),
  })) as ISubMaterial[];

  if (materialsList.length > 0) {
    dispatch(
      insertMaterial({
        id: elem.id,
        material: elem,
        subMaterials: data,
      }),
    );
    return [];
  } else {
    return {
      id: elem.id,
      material: elem,
      subMaterials: data,
    };
  }
};

const changeTypeModified = async (dispatch: any, elem: IMaterial) => {
  const materialQ = query(
    collection(db, 'materials', elem.id, 'subMaterials'),
    orderBy('createdAt'),
  );
  const subMaterials = await getDocs(materialQ);
  const data = subMaterials.docs.map(doc => ({
    ...doc.data(),
    id: doc.id,
    createdAt: doc.data()?.createdAt?.toDate()?.toISOString(),
    updatedAt: doc.data()?.updatedAt?.toDate()?.toISOString(),
  })) as ISubMaterial[];
  dispatch(
    modifyMaterial({
      id: elem.id,
      material: elem,
      subMaterials: data,
    }),
  );
  return [];
};

const changeTypeRemoved = async (dispatch: any, elem: IMaterial) => {
  dispatch(
    removeMaterial({
      id: elem.id,
      material: elem,
      subMaterials: [],
    }),
  );
  return [];
};

export const getMaterials = async ({
  appStrings,
  successCallback,
  errorCallback,
}: IService) => {
  try {
    const docSnap = await getDocs(query(materialDocRef, orderBy('name')));

    const materials = docSnap.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    let allMaterials = null;
    let submaterialsPromise = materials.map(async elem => {
      const materialQ = query(
        collection(db, 'materials', elem.id, 'subMaterials'),
        orderBy('createdAt'),
      );
      const subMaterials = await getDocs(materialQ);
      const data = subMaterials.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      }));
      return { id: elem.id, material: elem, subMaterials: data };
    });
    await Promise.all(submaterialsPromise).then(resul => {
      allMaterials = resul;
    });
    successCallback && successCallback(allMaterials);
  } catch (e) {
    let errorMessage = appStrings.genericError;
    if (e instanceof FirebaseError) errorMessage = e.message;
    toastError(appStrings.getInformationError, errorMessage);
    errorCallback && errorCallback();
  }
};

export const addMaterial = async ({
  material,
  appStrings,
  successCallback,
  errorCallback,
}: {
  material: IMaterial;
} & IService) => {
  try {
    const { id, ...rest } = material;
    const docRef = await addDoc(materialDocRef, {
      ...rest,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    toastSuccess(appStrings.success, appStrings.saveSuccess);
    successCallback && successCallback(docRef.id);
  } catch (e) {
    errorCallback && errorCallback();
  }
};

export const updateMaterial = async ({
  material,
  appStrings,
  successCallback,
  errorCallback,
}: {
  material: IMaterial;
} & IService) => {
  try {
    const { id, ...rest } = material;
    const materialDocRef = doc(db, 'materials', id);
    await setDoc(materialDocRef, { ...rest, updatedAt: serverTimestamp() });
    toastSuccess(appStrings.success, appStrings.saveSuccess);
    successCallback && successCallback();
  } catch (e) {
    errorCallback && errorCallback();
  }
};

export const deleteMaterial = async ({
  materialId,
  appStrings,
  successCallback,
  errorCallback,
}: {
  materialId: string;
} & IService) => {
  try {
    const matRef = doc(db, 'materials', materialId);
    const subMatRef = collection(matRef, 'subMaterials');
    const matDoc = await getDoc(matRef);
    const subMatDocs = await getDocs(subMatRef);

    if (!matDoc.exists()) throw Error(appStrings.noRecords);

    const batch = writeBatch(db);
    for (const subMaterial of subMatDocs.docs) {
      batch.delete(doc(subMatRef, subMaterial.id));
    }

    batch.delete(matRef);

    await batch.commit();

    toastSuccess(appStrings.success, appStrings.saveSuccess);

    successCallback && successCallback();
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.saveError, errorMessage);

    errorCallback && errorCallback();
  }
};

export const addSubmaterial = async ({
  materialId,
  submaterial,
  appStrings,
  successCallback,
  errorCallback,
}: {
  materialId: string;
  submaterial: ISubMaterial;
} & IService) => {
  try {
    const { id, ...rest } = submaterial;
    const subMatRef = collection(db, 'materials', materialId, 'subMaterials');
    const matRef = doc(db, 'materials', materialId);
    const docRef = await addDoc(subMatRef, {
      ...rest,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    await updateDoc(matRef, { updatedAt: serverTimestamp() });
    toastSuccess(appStrings.success, appStrings.saveSuccess);
    successCallback && successCallback(materialId, docRef.id);
  } catch (e) {
    errorCallback && errorCallback();
  }
};

export const updateSubMaterial = async ({
  materialId,
  submaterial,
  appStrings,
  successCallback,
  errorCallback,
}: {
  materialId: string;
  submaterial: ISubMaterial;
} & IService) => {
  try {
    const { id, ...rest } = submaterial;
    const matRef = doc(db, 'materials', materialId);
    const subMaterialDocRef = doc(
      db,
      'materials',
      materialId,
      'subMaterials',
      id,
    );
    await setDoc(subMaterialDocRef, { ...rest, updatedAt: serverTimestamp() });
    await updateDoc(matRef, { updatedAt: serverTimestamp() });
    toastSuccess(appStrings.success, appStrings.saveSuccess);
    successCallback && successCallback(materialId, id);
  } catch (e) {
    errorCallback && errorCallback();
  }
};

export const deleteSubMaterial = async ({
  materialId,
  subMaterialId,
  appStrings,
  successCallback,
  errorCallback,
}: {
  materialId: string;
  subMaterialId: string;
} & IService) => {
  try {
    const matRef = doc(db, 'materials', materialId);
    const subMatRef = doc(collection(matRef, 'subMaterials'), subMaterialId);
    const matDoc = await getDoc(matRef);
    const subMatDoc = await getDoc(subMatRef);

    if (!matDoc.exists() || !subMatDoc.exists()) {
      throw Error(appStrings.noRecords);
    }

    const batch = writeBatch(db);
    const totalSubMat = subMatDoc.data().cost * subMatDoc.data().quantity;
    const totalMatCost = matDoc.data().cost - totalSubMat;

    batch.delete(subMatRef);
    batch.update(matRef, { cost: totalMatCost, updatedAt: serverTimestamp() });

    await batch.commit();

    toastSuccess(appStrings.success, appStrings.deleteSuccess);

    successCallback && successCallback();
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.saveError, errorMessage);

    errorCallback && errorCallback();
  }
};
