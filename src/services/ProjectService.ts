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
  onSnapshot,
  FirestoreError,
  serverTimestamp,
} from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { db } from '../config/firebaseConfig';
import { IProject } from '../types/project';
import { IService } from '../types/service';
import { toastSuccess, toastError } from '../utils/toast';
import { IProjectBudget } from '../types/projectBudget';
import { IProjectExtraBudget } from '../types/projectExtraBudget';
import { deleteCollect, listenersList } from './herperService';
import { store } from '../redux/store';
import {
  changeProjects,
  insertProject,
  modifyProject,
  removeProject,
} from '../redux/reducers/projectsSlice';

export const listenProjects = async ({
  appStrings,
  successCallback,
  errorCallback,
}: IService) => {
  try {
    const projectRef = collection(db, 'projects');
    const projectsQuery = query(projectRef, orderBy('createdAt'));
    const { dispatch, getState } = store;

    const unsubscribe = onSnapshot(
      projectsQuery,
      querySnapshot => {
        let projectsList = [...getState().projects.projects];

        const projects: any = querySnapshot.docChanges().map(async change => {
          const elem = {
            ...change.doc.data(),
            id: change.doc.id,
            createdAt: change.doc.data()?.createdAt?.toDate()?.toISOString(),
            updatedAt: change.doc.data()?.updatedAt?.toDate()?.toISOString(),
          } as IProject;

          if (change.type === 'added') {
            return changeTypeAdded(dispatch, projectsList, elem);
          }
          if (change.type === 'modified') {
            return changeTypeModified(dispatch, elem);
          }
          if (change.type === 'removed') {
            return changeTypeRemoved(dispatch, elem);
          }
        });

        Promise.all(projects).then(result => {
          result.flat().length && dispatch(changeProjects(result));
        });
      },
      error => {
        const index = listenersList.findIndex(e => e.name === 'projects');
        if (index !== -1) {
          listenersList.splice(index, 1);
          dispatch(changeProjects([]));
        }
        throw error;
      },
    );
    successCallback && successCallback(unsubscribe);
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError || error instanceof FirestoreError) {
      errorMessage = error.message;
    }
    toastError(appStrings.getInformationError, errorMessage);
    errorCallback && errorCallback();
  }
};

const changeTypeAdded = async (
  dispatch: any,
  projectsList: IProject[],
  elem: IProject,
) => {
  if (projectsList.length > 0) {
    dispatch(insertProject(elem));
    return [];
  } else {
    return elem;
  }
};

const changeTypeModified = async (dispatch: any, elem: IProject) => {
  dispatch(modifyProject(elem));
  return [];
};

const changeTypeRemoved = async (dispatch: any, elem: IProject) => {
  dispatch(removeProject(elem));
  return [];
};

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
      const budgetParams = {
        sumLabors: 0,
        sumMaterials: 0,
        sumSubcontracts: 0,
        sumOthers: 0,
        creationDate: new Date(),
      };
      const projectBudget: IProjectBudget = {
        ...budgetParams,
        exchange: 1,
        adminFee: 12,
      };
      const projectExtraBudget: IProjectExtraBudget = budgetParams;

      const { id, ...rest } = project;
      const projectRef = doc(collection(db, 'projects'));
      transaction.set(projectRef, {
        ...rest,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      const budgetRef = doc(
        db,
        'projects',
        projectRef.id,
        'projectBudget',
        'summary',
      );
      const extraBudgetRef = doc(
        db,
        'projects',
        projectRef.id,
        'projectExtraBudget',
        'summary',
      );
      transaction.set(budgetRef, projectBudget);
      transaction.set(extraBudgetRef, projectExtraBudget);

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
    await setDoc(projectRef, { ...rest, updatedAt: serverTimestamp() });

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
    await deleteCollect(budgetRef, [
      'budgetLabors',
      'budgetSubcontracts',
      'budgetOthers',
    ]);
    await deleteMaterialAndSubmaterials(extraBudgetRef);
    await deleteCollect(extraBudgetRef, [
      'budgetLabors',
      'budgetSubcontracts',
      'budgetOthers',
    ]);
    await deleteCollect(`${projectRef}/projectBudget`);
    await deleteCollect(`${projectRef}/projectExtraBudget`);
    await deleteCollect(`${projectRef}/projectOrders`, ['products']);
    await deleteCollect(`${projectRef}/projectInvoicing`, ['products']);
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
