import {
  query,
  where,
  collection,
  getDocs,
  startAt,
  endAt,
  orderBy,
  getDoc,
  doc,
  setDoc,
  runTransaction,
} from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { db } from '../config/firebaseConfig';
import { IProject } from '../types/project';
import { IService } from '../types/service';
import { toastSuccess, toastError } from '../utils/toast';
import { IProjectBudget } from '../types/projectBudget';

export const getAllProjects = async ({
  appStrings,
  successCallback,
  errorCallback,
}: IService) => {
  try {
    const userRef = collection(db, 'projects');
    const result = await getDocs(userRef);
    const data = result.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
    })) as IProject[];

    successCallback && successCallback(data);
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.getInformationError, errorMessage);

    errorCallback && errorCallback();
  }
};

export const getProjectById = async ({
  projectId,
  appStrings,
  successCallback,
  errorCallback,
}: { projectId: string } & IService) => {
  try {
    const userRef = doc(db, 'projects', projectId);
    const result = await getDoc(userRef);
    const data = { ...result.data(), id: result.id } as IProject;

    successCallback && successCallback(data);
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.getInformationError, errorMessage);

    errorCallback && errorCallback();
  }
};

export const getProjectsByStatus = async ({
  status,
  appStrings,
  successCallback,
  errorCallback,
}: { status: string } & IService) => {
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

    successCallback && successCallback(data);
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.getInformationError, errorMessage);

    errorCallback && errorCallback();
  }
};

export const getProjectsByName = async ({
  name,
  appStrings,
  successCallback,
  errorCallback,
}: { name: String } & IService) => {
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

    successCallback && successCallback(data);
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.getInformationError, errorMessage);

    errorCallback && errorCallback();
  }
};

export const createProject = async ({
  project,
  appStrings,
  successCallback,
  errorCallback,
}: { project: IProject } & IService) => {
  try {
    const data = await runTransaction(db, async transaction => {
      const projectBudget: IProjectBudget = {
        sumLabors: 0,
        sumMaterials: 0,
        sumSubcontracts: 0,
        exchange: 1,
        creationDate: new Date(),
      };
      const { id, ...rest } = project;
      const projectRef = doc(collection(db, 'projects'));
      transaction.set(projectRef, rest);
      const budgetRef = doc(
        db,
        'projects',
        projectRef.id,
        'projectBudget',
        'summary',
      );
      transaction.set(budgetRef, projectBudget);

      return {
        ...project,
        id: projectRef.id,
      } as IProject;
    });

    toastSuccess(appStrings.success, appStrings.saveSuccess);

    successCallback && successCallback(data);
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.saveError, errorMessage);

    errorCallback && errorCallback();
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
