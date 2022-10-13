import {
  collection,
  addDoc,
  getDocs,
  doc,
  setDoc,
  getDoc,
} from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { IProjectMaterialDelivered } from '../types/projectMaterialDelivered';

export const getProjectMaterialsDelivered = async (
  projectId: string,
): Promise<[String | null, IProjectMaterialDelivered[]]> => {
  try {
    const userRef = collection(
      db,
      'projects',
      projectId,
      'projectMaterialsDelivered',
    );
    const result = await getDocs(userRef);
    const data = result.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      subtotal: doc.data().cost * doc.data().quantity,
      difference: doc.data().quantity - doc.data().delivered,
    })) as IProjectMaterialDelivered[];

    return [null, data];
  } catch (error) {
    return [error + '', []];
  }
};

export const getProjectMaterialDeliveredById = async (
  projectId: string,
  projectMaterialDeliveredId: string,
): Promise<[String | null, IProjectMaterialDelivered | null]> => {
  try {
    const userRef = doc(
      db,
      'projects',
      projectId,
      'projectMaterialsDelivered',
      projectMaterialDeliveredId,
    );
    const result = await getDoc(userRef);
    const data = {
      ...result.data(),
      id: result.id,
      subtotal: result.data()?.cost * result.data()?.quantity,
    } as IProjectMaterialDelivered;

    return [null, data];
  } catch (error) {
    return [error + '', null];
  }
};

export const createProjectMaterialDelivered = async (
  projectId: string,
  projectMaterialDelivered: IProjectMaterialDelivered,
): Promise<String | null> => {
  try {
    const { id, subtotal, difference, ...rest } = projectMaterialDelivered;
    const userRef = collection(
      db,
      'projects',
      projectId,
      'projectMaterialsDelivered',
    );
    const result = await addDoc(userRef, rest);

    console.log(result.id);

    return null;
  } catch (error) {
    return error + '';
  }
};

export const updateProjectMaterialDelivered = async (
  projectId: string,
  projectMaterialDelivered: IProjectMaterialDelivered,
): Promise<String | null> => {
  try {
    const { id, subtotal, difference, ...rest } = projectMaterialDelivered;
    const userRef = doc(
      db,
      'projects',
      projectId,
      'projectMaterialsDelivered',
      id,
    );
    await setDoc(userRef, rest);

    return null;
  } catch (error) {
    return error + '';
  }
};
