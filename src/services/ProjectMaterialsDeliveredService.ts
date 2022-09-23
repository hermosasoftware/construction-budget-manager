import { collection, addDoc, getDocs } from 'firebase/firestore';
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
      diference: doc.data().quantity - doc.data().delivered,
    })) as IProjectMaterialDelivered[];

    return [null, data];
  } catch (error) {
    return [error + '', []];
  }
};

export const createProjectMaterialDelivered = async (
  projectId: string,
  project: IProjectMaterialDelivered,
): Promise<String | null> => {
  try {
    const userRef = collection(
      db,
      'projects',
      projectId,
      'projectMaterialsDelivered',
    );
    const result = await addDoc(userRef, project);

    console.log(result.id);

    return null;
  } catch (error) {
    return error + '';
  }
};
