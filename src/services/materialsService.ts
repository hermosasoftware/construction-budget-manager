import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { db } from '../config/firebaseConfig';
import { IMaterial, IMaterialBreakdown } from '../types/collections';
import { IService } from '../types/service';
import { toastError, toastSuccess } from '../utils/toast';

const materialDocRef = collection(db, 'materials');

export const getMaterials = async (): Promise<IMaterialBreakdown[] | null> => {
  try {
    const docSnap = await getDocs(materialDocRef);

    const materials = docSnap.docs.map(doc => ({ ...doc.data(), id: doc.id }));

    let allMaterials = null;
    let submaterialsPromise = materials.map(async elem => {
      const materialQ = query(
        collection(db, 'materials', elem.id, 'subMaterials'),
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
    return allMaterials;
  } catch (error) {
    console.log(error);
    return null;
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
    const { cost, name, unit } = material;
    const docRef = await addDoc(materialDocRef, { name, unit, cost });
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
    const { cost, name, unit, id } = material;
    const materialDocRef = doc(db, 'materials', id);
    await setDoc(materialDocRef, { name, unit, cost });
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

    batch.update(matRef, { cost: totalMatCost });
    batch.delete(subMatRef);

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
