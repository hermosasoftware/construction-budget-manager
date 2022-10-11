import {
  collection,
  addDoc,
  getDocs,
  doc,
  setDoc,
  getDoc,
} from 'firebase/firestore';
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
      date: doc.data().date.toDate(),
    })) as IProjectExpense[];

    return [null, data];
  } catch (error) {
    return [error + '', []];
  }
};

export const getProjectExpenseById = async (
  projectId: string,
  projectExpenseId: string,
): Promise<[String | null, IProjectExpense | null]> => {
  try {
    const userRef = doc(
      db,
      'projects',
      projectId,
      'projectExpenses',
      projectExpenseId,
    );
    const result = await getDoc(userRef);
    const data = {
      ...result.data(),
      id: result.id,
      date: result.data()?.date.toDate(),
    } as IProjectExpense;

    return [null, data];
  } catch (error) {
    return [error + '', null];
  }
};

export const createProjectExpense = async (
  projectId: string,
  projectExpense: IProjectExpense,
): Promise<String | null> => {
  try {
    const { id, ...rest } = projectExpense;
    const userRef = collection(db, 'projects', projectId, 'projectExpenses');
    const result = await addDoc(userRef, rest);

    console.log(result.id);

    return null;
  } catch (error) {
    return error + '';
  }
};

export const updateProjectExpense = async (
  projectId: string,
  projectExpense: IProjectExpense,
): Promise<String | null> => {
  try {
    const { id, ...rest } = projectExpense;
    const userRef = doc(db, 'projects', projectId, 'projectExpenses', id);
    await setDoc(userRef, rest);

    return null;
  } catch (error) {
    return error + '';
  }
};
