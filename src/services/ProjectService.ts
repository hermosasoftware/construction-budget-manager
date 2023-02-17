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
  deleteDoc,
  documentId,
} from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { db } from '../config/firebaseConfig';
import { IProject } from '../types/project';
import { IService } from '../types/service';
import { toastSuccess, toastError } from '../utils/toast';
import { IProjectBudget } from '../types/projectBudget';
import { deleteCollect } from './herperService';

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
        adminFee: 12,
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

    successCallback && successCallback(project);
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
    const budgetRef = `${projectRef}/projectBudget`;
    const extraBudgetRef = `${projectRef}/projectExtraBudget`;

    await deleteMaterialAndSubmaterials(budgetRef);
    await deleteCollect(budgetRef, ['budgetLabors', 'budgetSubcontracts']);
    await deleteMaterialAndSubmaterials(extraBudgetRef);
    await deleteCollect(extraBudgetRef, ['budgetLabors', 'budgetSubcontracts']);
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

const deleteMaterialAndSubmaterials = async (budgetRef: string) => {
  const collectDocs = await getDocs(collection(db, budgetRef));
  if (!collectDocs.empty) {
    for (const data of collectDocs.docs) {
      await deleteCollect(`${budgetRef}/${data.id}/budgetMaterials`, [
        'subMaterials',
      ]);
    }
  }
};

export const getProjectActivities = async ({
  projectId,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
} & IService) => {
  try {
    const budgetRef = query(
      collection(db, 'projects', projectId, 'projectBudget'),
      where(documentId(), '!=', 'summary'),
    );
    const extraBudgetRef = query(
      collection(db, 'projects', projectId, 'projectExtraBudget'),
      where(documentId(), '!=', 'summary'),
    );
    const budget = await getDocs(budgetRef);
    const extraBudget = await getDocs(extraBudgetRef);
    const budgetActivities = budget.docs.map(doc => ({
      id: doc.id,
      activity: doc.data().activity,
    }));
    const extraBudgetActivities = extraBudget.docs.map(doc => ({
      id: doc.id,
      activity: doc.data().activity,
      isExtra: true,
    }));

    successCallback &&
      successCallback([...budgetActivities, ...extraBudgetActivities]);
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.getInformationError, errorMessage);

    errorCallback && errorCallback();
  }
};
