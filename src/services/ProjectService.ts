import {
  query,
  where,
  collection,
  addDoc,
  getDocs,
  startAt,
  endAt,
  orderBy,
  getDoc,
  doc,
} from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { IProject } from '../types/project';

export const getAllProjects = async (): Promise<
  [String | null, IProject[]]
> => {
  try {
    const userRef = collection(db, 'projects');
    const result = await getDocs(userRef);
    const data = result.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
    })) as IProject[];

    return [null, data];
  } catch (error) {
    return [error + '', []];
  }
};

export const getProjectById = async (
  id: string,
): Promise<[String | null, IProject | null]> => {
  try {
    const userRef = doc(db, 'projects', id);
    const result = await getDoc(userRef);
    const data = { ...result.data(), id: result.id } as IProject;

    return [null, data];
  } catch (error) {
    return [error + '', null];
  }
};

export const getProjectsByStatus = async (
  status: boolean,
): Promise<[String | null, IProject[]]> => {
  try {
    const userRef = query(
      collection(db, 'projects'),
      where('status', '==', status),
    );
    const result = await getDocs(userRef);
    const data = result.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
    })) as IProject[];
    return [null, data];
  } catch (error) {
    return [error + '', []];
  }
};

export const getProjectsByName = async (
  name: String,
): Promise<[String | null, IProject[]]> => {
  try {
    const userRef = query(
      collection(db, 'projects'),
      orderBy('name'),
      startAt(name),
      endAt(name + '~'),
    );
    const result = await getDocs(userRef);
    const data = result.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
    })) as IProject[];

    return [null, data];
  } catch (error) {
    return [error + '', []];
  }
};

export const createProject = async (
  project: IProject,
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
