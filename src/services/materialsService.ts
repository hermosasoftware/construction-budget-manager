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
import { IMaterial } from '../types/collections';

const materialDocRef = collection(db, 'materials');

export const getMaterials = async (): Promise<IMaterial[] | null> => {
  try {
    const docSnap = await getDocs(materialDocRef);
    return docSnap.docs.map(doc => {
      return {
        cost: doc.get('cost'),
        id: doc.id,
        name: doc.get('name'),
        unit: doc.get('unit'),
      };
    });
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
