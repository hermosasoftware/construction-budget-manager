import {
  addDoc,
  collection,
  doc,
  endAt,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  startAt,
} from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { IMaterial, IMaterialBreakdown } from '../types/collections';

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

export const addMaterial = async (material: IMaterial) => {
  try {
    const { cost, name, unit } = material;
    const docRef = await addDoc(materialDocRef, { name, unit, cost });
    return docRef.id;
  } catch (e) {}
};

export const updateMaterial = async (material: IMaterial) => {
  try {
    const { cost, name, unit, id } = material;
    const materialDocRef = doc(db, 'materials', id);
    await setDoc(materialDocRef, { name, unit, cost });
    return true;
  } catch (e) {
    return false;
  }
};
