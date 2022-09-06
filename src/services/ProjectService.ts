import {
  query,
  where,
  collection,
  addDoc,
  getDocs,
  startAt,
  endAt,
  orderBy,
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
      name: doc.data().name,
      client: doc.data().client,
      location: doc.data().location,
    })) as IProject[];

    return [null, data];
  } catch (error) {
    return [error + '', []];
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
      name: doc.data().name,
      client: doc.data().client,
      location: doc.data().location,
      status: doc.data().status,
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
      name: doc.data().name,
      client: doc.data().client,
      location: doc.data().location,
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
