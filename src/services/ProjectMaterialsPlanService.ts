import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  setDoc,
} from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { IProjectMaterialPlan } from '../types/projectMaterialPlan';

export const getProjectMaterialsPlan = async (
  projectId: string,
): Promise<[String | null, IProjectMaterialPlan[]]> => {
  try {
    const userRef = collection(
      db,
      'projects',
      projectId,
      'projectMaterialsPlan',
    );
    const result = await getDocs(userRef);
    const data = result.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      subtotal: doc.data().cost * doc.data().quantity,
    })) as IProjectMaterialPlan[];

    return [null, data];
  } catch (error) {
    return [error + '', []];
  }
};

export const getProjectMaterialPlanById = async (
  projectId: string,
  projectMaterialPlanId: string,
): Promise<[String | null, IProjectMaterialPlan | null]> => {
  try {
    const userRef = doc(
      db,
      'projects',
      projectId,
      'projectMaterialsPlan',
      projectMaterialPlanId,
    );
    const result = await getDoc(userRef);
    const data = {
      ...result.data(),
      id: result.id,
      subtotal: result.data()?.cost * result.data()?.quantity,
    } as IProjectMaterialPlan;

    return [null, data];
  } catch (error) {
    return [error + '', null];
  }
};

export const createProjectMaterialPlan = async (
  projectId: string,
  projectMaterialPlan: IProjectMaterialPlan,
): Promise<String | null> => {
  try {
    const { id, subtotal, ...rest } = projectMaterialPlan;
    const userRef = collection(
      db,
      'projects',
      projectId,
      'projectMaterialsPlan',
    );
    await addDoc(userRef, rest);

    return null;
  } catch (error) {
    return error + '';
  }
};

export const updateProjectMaterialPlan = async (
  projectId: string,
  projectMaterialPlan: IProjectMaterialPlan,
): Promise<String | null> => {
  try {
    const { id, subtotal, ...rest } = projectMaterialPlan;
    const userRef = doc(db, 'projects', projectId, 'projectMaterialsPlan', id);
    await setDoc(userRef, rest);

    return null;
  } catch (error) {
    return error + '';
  }
};
