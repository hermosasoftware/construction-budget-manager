import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { IProjectExpense } from '../types/projectExpense';

export const getProjectExpenses = async (
  projectId: string,
): Promise<[String | null, IProjectExpense[]]> => {
  try {
    const userRef = collection(db, 'projects', projectId, 'projectExpenses');
    const result = await getDocs(userRef);
    const data = result.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      date: new Date(doc.data().date.toDate()).toDateString(),
    })) as IProjectExpense[];

    return [null, data];
  } catch (error) {
    return [error + '', []];
  }
};

export const createProjectExpense = async (
  project: IProjectExpense,
): Promise<String | null> => {
  try {
    const userRef = collection(db, 'projects');
    const result = await addDoc(userRef, project);

    console.log(result.id);

    return null;
  } catch (error) {
    return error + '';
  }
};
