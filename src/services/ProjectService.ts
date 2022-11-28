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
  writeBatch,
  deleteDoc,
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
    const projectRef = collection(db, 'projects');
    const result = await getDocs(projectRef);
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
    const projectRef = doc(db, 'projects', projectId);
    const result = await getDoc(projectRef);
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
    const projectRef = query(
      collection(db, 'projects'),
      where('status', '==', status),
    );
    const result = await getDocs(projectRef);
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
    const projectRef = query(
      collection(db, 'projects'),
      orderBy('name'),
      startAt(name),
      endAt(name + '~'),
    );
    const result = await getDocs(projectRef);
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
    const projectRef = doc(db, 'projects', id);
    await setDoc(projectRef, rest);

    toastSuccess(appStrings.success, appStrings.saveSuccess);

    successCallback && successCallback();
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.saveError, errorMessage);

    errorCallback && errorCallback();
  }
};

export const deleteProject = async ({
  projectId,
  appStrings,
  successCallback,
  errorCallback,
}: { projectId: string } & IService) => {
  try {
    const projectRef = `projects/${projectId}`;
    const budgetRef = `${projectRef}/projectBudget/summary`;
    const extraBudgetRef = `${projectRef}/projectExtraBudget/summary`;

    await deleteCollect(`${budgetRef}/budgetLabors`);
    await deleteCollect(`${budgetRef}/budgetSubcontracts`);
    await deleteCollect(`${budgetRef}/budgetMaterials`, ['subMaterials']);
    await deleteCollect(`${extraBudgetRef}/budgetLabors`);
    await deleteCollect(`${extraBudgetRef}/budgetSubcontracts`);
    await deleteCollect(`${extraBudgetRef}/budgetMaterials`, ['subMaterials']);
    await deleteCollect(`${projectRef}/projectBudget`);
    await deleteCollect(`${projectRef}/projectExtraBudget`);
    await deleteCollect(`${projectRef}/projectInvoicing`);
    await deleteCollect(`${projectRef}/projectExpenses`);
    await deleteDoc(doc(db, projectRef));

    toastSuccess(appStrings.success, appStrings.deleteSuccess);

    successCallback && successCallback();
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.saveError, errorMessage);

    errorCallback && errorCallback();
  }
};

const deleteCollect = async (collect: string, subCollects?: string[]) => {
  const collectRef = collection(db, collect);
  const collectDocs = await getDocs(collectRef);
  if (!collectDocs.empty) {
    let batch = writeBatch(db);
    let i = 0;
    for (const data of collectDocs.docs) {
      if (subCollects)
        for (const subCollect of subCollects) {
          const subCollectDocs = await getDocs(
            collection(doc(collectRef, data.id), subCollect),
          );
          for (const subData of subCollectDocs.docs) {
            batch.delete(
              doc(collection(doc(collectRef, data.id), subCollect), subData.id),
            );
            i++;
            if (i > 400) {
              i = 0;
              await batch.commit();
              batch = writeBatch(db);
            }
          }
        }
      batch.delete(doc(collectRef, data.id));
      i++;
      if (i > 400) {
        i = 0;
        await batch.commit();
        batch = writeBatch(db);
      }
    }
    if (i > 0) await batch.commit();
  }
};
