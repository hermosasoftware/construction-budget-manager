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
  setDoc,
} from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { db } from '../config/firebaseConfig';
import { IProject } from '../types/project';
import { IService } from '../types/service';
import { toastSuccess, toastError } from '../utils/toast';

export const getAllProjects = async ({
  appStrings,
  successCallback,
  errorCallback,
}: IService): Promise<IProject[]> => {
  try {
    const userRef = collection(db, 'projects');
    const result = await getDocs(userRef);
    const data = result.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
    })) as IProject[];

    successCallback && successCallback();
    return data;
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.getInformationError, errorMessage);

    errorCallback && errorCallback();
    return [];
  }
};

export const getProjectById = async ({
  projectId,
  appStrings,
  successCallback,
  errorCallback,
}: { projectId: string } & IService): Promise<IProject | null> => {
  try {
    const userRef = doc(db, 'projects', projectId);
    const result = await getDoc(userRef);
    const data = { ...result.data(), id: result.id } as IProject;

    successCallback && successCallback();
    return data;
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.getInformationError, errorMessage);

    errorCallback && errorCallback();
    return null;
  }
};

export const getProjectsByStatus = async ({
  status,
  appStrings,
  successCallback,
  errorCallback,
}: { status: string } & IService): Promise<IProject[]> => {
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

    successCallback && successCallback();
    return data;
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.getInformationError, errorMessage);

    errorCallback && errorCallback();
    return [];
  }
};

export const getProjectsByName = async ({
  name,
  appStrings,
  successCallback,
  errorCallback,
}: { name: String } & IService): Promise<IProject[]> => {
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

    successCallback && successCallback();
    return data;
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.getInformationError, errorMessage);

    errorCallback && errorCallback();
    return [];
  }
};

export const createProject = async ({
  project,
  appStrings,
  successCallback,
  errorCallback,
}: { project: IProject } & IService): Promise<IProject | null> => {
  try {
    const { id, ...rest } = project;
    const userRef = collection(db, 'projects');
    const result = await addDoc(userRef, rest);
    const data = { ...project, id: result.id } as IProject;

    toastSuccess(appStrings.success, appStrings.saveSuccess);

    successCallback && successCallback();
    return data;
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.saveError, errorMessage);

    errorCallback && errorCallback();
    return null;
  }
};

export const updateProject = async ({
  project,
  appStrings,
  successCallback,
  errorCallback,
}: { project: IProject } & IService) => {
  try {
    const { id, ...rest } = project;
    const userRef = doc(db, 'projects', id);
    await setDoc(userRef, rest);

    toastSuccess(appStrings.success, appStrings.saveSuccess);

    successCallback && successCallback();
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.saveError, errorMessage);

    errorCallback && errorCallback();
  }
};
