import { FirebaseError } from 'firebase/app';
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
import { db } from '../config/firebaseConfig';
import { IProject } from '../types/project';
import { IService } from '../types/service';

export const getAllProjects = async ({
  toast,
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

    toast({
      title: appStrings.getInformationError,
      description: errorMessage,
      status: 'error',
      duration: 5000,
      isClosable: true,
      position: 'top-right',
    });

    errorCallback && errorCallback();
    return [];
  }
};

export const getProjectById = async ({
  projectId,
  toast,
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

    toast({
      title: appStrings.getInformationError,
      description: errorMessage,
      status: 'error',
      duration: 5000,
      isClosable: true,
      position: 'top-right',
    });

    errorCallback && errorCallback();
    return null;
  }
};

export const getProjectsByStatus = async ({
  status,
  toast,
  appStrings,
  successCallback,
  errorCallback,
}: { status: string } & IService): Promise<IProject[]> => {
  try {
    const userRef = query(
      collection(db, 'projects'),
      where('status', '==', status),
      orderBy('status'),
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

    toast({
      title: appStrings.getInformationError,
      description: errorMessage,
      status: 'error',
      duration: 5000,
      isClosable: true,
      position: 'top-right',
    });

    errorCallback && errorCallback();
    return [];
  }
};

export const getProjectsByName = async ({
  name,
  toast,
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

    toast({
      title: appStrings.getInformationError,
      description: errorMessage,
      status: 'error',
      duration: 5000,
      isClosable: true,
      position: 'top-right',
    });

    errorCallback && errorCallback();
    return [];
  }
};

export const createProject = async ({
  project,
  toast,
  appStrings,
  successCallback,
  errorCallback,
}: { project: IProject } & IService): Promise<IProject | null> => {
  try {
    const { id, ...rest } = project;
    const userRef = collection(db, 'projects');
    const result = await addDoc(userRef, rest);
    const data = { ...project, id: result.id } as IProject;
    toast({
      title: appStrings.success,
      description: appStrings.saveSuccess,
      status: 'success',
      duration: 3000,
      isClosable: true,
      position: 'top-right',
    });

    successCallback && successCallback();
    return data;
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toast({
      title: appStrings.saveError,
      description: errorMessage,
      status: 'error',
      duration: 5000,
      isClosable: true,
      position: 'top-right',
    });

    errorCallback && errorCallback();
    return null;
  }
};

export const updateProject = async ({
  project,
  toast,
  appStrings,
  successCallback,
  errorCallback,
}: { project: IProject } & IService) => {
  try {
    const { id, ...rest } = project;
    const userRef = doc(db, 'projects', id);
    await setDoc(userRef, rest);

    toast({
      title: appStrings.success,
      description: appStrings.saveSuccess,
      status: 'success',
      duration: 3000,
      isClosable: true,
      position: 'top-right',
    });

    successCallback && successCallback();
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toast({
      title: appStrings.saveError,
      description: errorMessage,
      status: 'error',
      duration: 5000,
      isClosable: true,
      position: 'top-right',
    });

    errorCallback && errorCallback();
  }
};
