import { collection, addDoc, getDocs } from 'firebase/firestore';
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

export const createProjectMaterialPlan = async (
  projectId: string,
  project: IProjectMaterialPlan,
): Promise<String | null> => {
  try {
    const userRef = collection(
      db,
      'projects',
      projectId,
      'projectMaterialsPlan',
    );
    const result = await addDoc(userRef, project);

    console.log(result.id);

    return null;
  } catch (error) {
    return error + '';
  }
};
