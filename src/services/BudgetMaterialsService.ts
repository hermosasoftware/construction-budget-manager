import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  runTransaction,
  writeBatch,
  serverTimestamp,
  orderBy,
  onSnapshot,
  FirestoreError,
} from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { db } from '../config/firebaseConfig';
import { IBudgetMaterial } from '../types/budgetMaterial';
import { IService } from '../types/service';
import { toastSuccess, toastError } from '../utils/toast';
import { IMaterialBreakdown, ISubMaterial } from '../types/collections';
import {
  changeBudgetMaterials,
  insertBudgetMaterial,
  modifyBudgetMaterial,
  removeBudgetMaterial,
} from '../redux/reducers/budgetMaterialsSlice';
import { store } from '../redux/store';
import { listenersList } from './herperService';

export const listenBudgetMaterials = ({
  projectId,
  activityId,
  appStrings,
  successCallback,
  errorCallback,
}: { projectId: string; activityId: string } & IService) => {
  try {
    const matRef = collection(
      db,
      'projects',
      projectId,
      'projectBudget',
      activityId,
      'budgetMaterials',
    );
    const matQuery = query(matRef, orderBy('createdAt'));
    const { dispatch, getState } = store;

    const unsubscribe = onSnapshot(
      matQuery,
      querySnapshot => {
        let materialsList = [...getState().budgetMaterials.budgetMaterials];

        const projectBudgetMaterials: any = querySnapshot
          .docChanges()
          .map(async change => {
            const elem = {
              ...change.doc.data(),
              id: change.doc.id,
              subtotal: change.doc.data().cost * change.doc.data().quantity,
              createdAt: change.doc.data()?.createdAt?.toDate()?.toISOString(),
              updatedAt: change.doc.data()?.updatedAt?.toDate()?.toISOString(),
            } as IBudgetMaterial;

            if (change.type === 'added') {
              return changeTypeAdded(dispatch, materialsList, matRef, elem);
            }
            if (change.type === 'modified') {
              return changeTypeModified(dispatch, matRef, elem);
            }
            if (change.type === 'removed') {
              return changeTypeRemoved(dispatch, elem);
            }
          });

        Promise.all(projectBudgetMaterials).then(result => {
          result.flat().length && dispatch(changeBudgetMaterials(result));
        });
      },
      error => {
        const index = listenersList.findIndex(
          e => e.name === 'budgetMaterials',
        );
        if (index !== -1) {
          listenersList.splice(index, 1);
          dispatch(changeBudgetMaterials([]));
        }
        throw error;
      },
    );
    successCallback && successCallback(unsubscribe);
  } catch (e) {
    let errorMessage = appStrings.genericError;
    if (e instanceof FirebaseError || e instanceof FirestoreError) {
      errorMessage = e.message;
    }
    toastError(appStrings.getInformationError, errorMessage);
    errorCallback && errorCallback();
  }
};

const changeTypeAdded = async (
  dispatch: any,
  materialsList: IMaterialBreakdown[],
  matRef: any,
  elem: IBudgetMaterial,
) => {
  const subMaterialQ = query(
    collection(matRef, elem.id, 'subMaterials'),
    orderBy('createdAt'),
  );
  const subMaterials = await getDocs(subMaterialQ);
  const data = subMaterials.docs.map(doc => ({
    ...doc.data(),
    id: doc.id,
    createdAt: doc.data()?.createdAt?.toDate()?.toISOString(),
    updatedAt: doc.data()?.updatedAt?.toDate()?.toISOString(),
  })) as ISubMaterial[];

  if (materialsList.length > 0) {
    dispatch(
      insertBudgetMaterial({
        id: elem.id,
        material: elem,
        subMaterials: data,
      }),
    );
    return [];
  } else {
    return {
      id: elem.id,
      material: elem,
      subMaterials: data,
    };
  }
};

const changeTypeModified = async (
  dispatch: any,
  matRef: any,
  elem: IBudgetMaterial,
) => {
  const subMaterialQ = query(
    collection(matRef, elem.id, 'subMaterials'),
    orderBy('createdAt'),
  );
  const subMaterials = await getDocs(subMaterialQ);
  const data = subMaterials.docs.map(doc => ({
    ...doc.data(),
    id: doc.id,
    createdAt: doc.data()?.createdAt?.toDate()?.toISOString(),
    updatedAt: doc.data()?.updatedAt?.toDate()?.toISOString(),
  })) as ISubMaterial[];
  dispatch(
    modifyBudgetMaterial({
      id: elem.id,
      material: elem,
      subMaterials: data,
    }),
  );
  return [];
};

const changeTypeRemoved = async (dispatch: any, elem: IBudgetMaterial) => {
  dispatch(
    removeBudgetMaterial({
      id: elem.id,
      material: elem,
      subMaterials: [],
    }),
  );
  return [];
};

export const getBudgetMaterials = async ({
  projectId,
  activityId,
  appStrings,
  successCallback,
  errorCallback,
}: { projectId: string; activityId: string } & IService) => {
  try {
    const matRef = query(
      collection(
        db,
        'projects',
        projectId,
        'projectBudget',
        activityId,
        'budgetMaterials',
      ),
      orderBy('createdAt'),
    );
    const result = await getDocs(matRef);
    const data = result.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      subtotal: doc.data().cost * doc.data().quantity,
      createdAt: doc.data()?.createdAt?.toDate()?.toISOString(),
      updatedAt: doc.data()?.updatedAt?.toDate()?.toISOString(),
    })) as IBudgetMaterial[];

    let allMaterials = null;
    let submaterialsPromise = data.map(async elem => {
      const materialQ = query(
        collection(
          db,
          'projects',
          projectId,
          'projectBudget',
          activityId,
          'budgetMaterials',
          elem.id,
          'subMaterials',
        ),
        orderBy('createdAt'),
      );
      const subMaterials = await getDocs(materialQ);
      const data = subMaterials.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      }));
      return { id: elem.id, material: elem, subMaterials: data };
    });
    await Promise.all(submaterialsPromise).then(resul => {
      allMaterials = resul;
    });

    successCallback && successCallback(allMaterials);
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.getInformationError, errorMessage);

    errorCallback && errorCallback();
  }
};

export const getBudgetMaterialById = async ({
  projectId,
  activityId,
  budgetMaterialId,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  activityId: string;
  budgetMaterialId: string;
} & IService) => {
  try {
    const matRef = doc(
      db,
      'projects',
      projectId,
      'projectBudget',
      activityId,
      'budgetMaterials',
      budgetMaterialId,
    );
    const result = await getDoc(matRef);
    const data = {
      ...result.data(),
      id: result.id,
      subtotal: result.data()?.cost * result.data()?.quantity,
    } as IBudgetMaterial;

    successCallback && successCallback(data);
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.getInformationError, errorMessage);

    errorCallback && errorCallback();
  }
};

export const createBudgetMaterial = async ({
  projectId,
  activityId,
  budgetMaterial,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  activityId: string;
  budgetMaterial: IBudgetMaterial;
} & IService) => {
  try {
    const data = await runTransaction(db, async transaction => {
      const { id, subtotal, subMaterials, ...rest } = budgetMaterial;
      const budgetRef = collection(db, 'projects', projectId, 'projectBudget');
      const matRef = doc(collection(budgetRef, activityId, 'budgetMaterials'));
      const summaryRef = doc(budgetRef, 'summary');
      const activityRef = doc(budgetRef, activityId);
      const summaryDoc = await transaction.get(summaryRef);
      const activityDoc = await transaction.get(activityRef);

      if (!summaryDoc.exists() || !activityDoc.exists()) {
        throw Error(appStrings.noRecords);
      }

      let summaryTotal = summaryDoc.data()?.sumMaterials;
      let activityTotal = activityDoc.data()?.sumMaterials;

      const batch = writeBatch(db);
      if (subMaterials && rest.hasSubMaterials) {
        let subMatSubtotal = 0;
        subMaterials.forEach(e => {
          const { id, ...rest } = e;
          batch.set(doc(matRef, 'subMaterials', id), {
            ...rest,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          subMatSubtotal += rest.cost * rest.quantity;
        });
        summaryTotal += subMatSubtotal;
        activityTotal += subMatSubtotal;
      } else {
        summaryTotal += subtotal;
        activityTotal += subtotal;
      }

      transaction.update(summaryRef, { sumMaterials: summaryTotal });
      transaction.update(activityRef, { sumMaterials: activityTotal });
      transaction.set(matRef, {
        ...rest,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      await batch.commit();

      return {
        ...budgetMaterial,
        id: matRef.id,
        subMaterials: rest.hasSubMaterials ? subMaterials : [],
      } as IBudgetMaterial;
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

export const updateBudgetMaterial = async ({
  projectId,
  activityId,
  budgetMaterial,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  activityId: string;
  budgetMaterial: IBudgetMaterial;
} & IService) => {
  try {
    await runTransaction(db, async transaction => {
      const { id, createdAt, subtotal, subMaterials, ...rest } = budgetMaterial;
      const budgetRef = collection(db, 'projects', projectId, 'projectBudget');
      const matRef = doc(budgetRef, activityId, 'budgetMaterials', id);
      const summaryRef = doc(budgetRef, 'summary');
      const activityRef = doc(budgetRef, activityId);
      const matDoc = await transaction.get(matRef);
      const summaryDoc = await transaction.get(summaryRef);
      const activityDoc = await transaction.get(activityRef);

      if (!matDoc.exists() || !summaryDoc.exists() || !activityDoc.exists()) {
        throw Error(appStrings.noRecords);
      }

      let newSum = 0;
      let subMatSubtotal = 0;
      //Material with submaterials
      if (matDoc.data()?.hasSubMaterials && rest.hasSubMaterials) {
        subMaterials?.forEach(m => (subMatSubtotal += m.cost * m.quantity));
        newSum = subMatSubtotal - subMatSubtotal;
      } //Changed material to have submaterials
      else if (!matDoc.data()?.hasSubMaterials && rest.hasSubMaterials) {
        subMaterials?.forEach(m => (subMatSubtotal += m.cost * m.quantity));
        newSum = subMatSubtotal - matDoc.data()?.cost * matDoc.data()?.quantity;
      } //Changed material to not have submaterials
      else if (matDoc.data()?.hasSubMaterials && !rest.hasSubMaterials) {
        subMaterials?.forEach(m => (subMatSubtotal += m.cost * m.quantity));
        newSum = rest.cost * rest.quantity - subMatSubtotal;
      } //Material without submaterials
      else {
        newSum = subtotal - matDoc.data()?.cost * matDoc.data()?.quantity;
      }

      const summaryTotal = summaryDoc.data()?.sumMaterials + newSum;
      const activityTotal = activityDoc.data()?.sumMaterials + newSum;

      transaction.update(summaryRef, { sumMaterials: summaryTotal });
      transaction.update(activityRef, { sumMaterials: activityTotal });
      transaction.update(matRef, { ...rest, updatedAt: serverTimestamp() });
    });

    toastSuccess(appStrings.success, appStrings.saveSuccess);

    successCallback && successCallback(budgetMaterial);
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.saveError, errorMessage);

    errorCallback && errorCallback();
  }
};

export const deleteBudgetMaterial = async ({
  projectId,
  activityId,
  budgetMaterialId,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  activityId: string;
  budgetMaterialId: string;
} & IService) => {
  try {
    const budgetRef = collection(db, 'projects', projectId, 'projectBudget');
    const matRef = doc(
      budgetRef,
      activityId,
      'budgetMaterials',
      budgetMaterialId,
    );
    const subMatRef = collection(matRef, 'subMaterials');
    const summaryRef = doc(budgetRef, 'summary');
    const activityRef = doc(budgetRef, activityId);
    const matDoc = await getDoc(matRef);
    const subMatDocs = await getDocs(subMatRef);
    const summaryDoc = await getDoc(summaryRef);
    const activityDoc = await getDoc(activityRef);

    if (!matDoc.exists() || !summaryDoc.exists() || !activityDoc.exists()) {
      throw Error(appStrings.noRecords);
    }

    let newSum = 0;
    if (matDoc.data()?.hasSubMaterials) {
      for (const subMaterial of subMatDocs.docs) {
        newSum += subMaterial.data()?.cost * subMaterial.data()?.quantity;
      }
    } else {
      newSum = matDoc.data()?.cost * matDoc.data()?.quantity;
    }

    const batch = writeBatch(db);
    for (const subMaterial of subMatDocs.docs) {
      batch.delete(doc(subMatRef, subMaterial.id));
    }

    const summaryTotal = summaryDoc.data()?.sumMaterials - newSum;
    const activityTotal = activityDoc.data()?.sumMaterials - newSum;

    batch.update(summaryRef, { sumMaterials: summaryTotal });
    batch.update(activityRef, { sumMaterials: activityTotal });
    batch.delete(matRef);

    await batch.commit();

    toastSuccess(appStrings.success, appStrings.deleteSuccess);

    successCallback && successCallback();
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.deleteError, errorMessage);

    errorCallback && errorCallback();
  }
};

export const createBudgetSubMaterial = async ({
  projectId,
  activityId,
  materialId,
  budgetSubMaterial,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  activityId: string;
  materialId: string;
  budgetSubMaterial: ISubMaterial;
} & IService) => {
  try {
    const data = await runTransaction(db, async transaction => {
      const { id, ...rest } = budgetSubMaterial;
      const budgetRef = collection(db, 'projects', projectId, 'projectBudget');
      const matRef = doc(budgetRef, activityId, 'budgetMaterials', materialId);
      const subMatRef = doc(
        collection(
          budgetRef,
          activityId,
          'budgetMaterials',
          materialId,
          'subMaterials',
        ),
      );
      const summaryRef = doc(budgetRef, 'summary');
      const activityRef = doc(budgetRef, activityId);
      const summaryDoc = await transaction.get(summaryRef);
      const activityDoc = await transaction.get(activityRef);

      if (!summaryDoc.exists() || !activityDoc.exists()) {
        throw Error(appStrings.noRecords);
      }
      const subtotal = rest.cost * rest.quantity;
      const summaryTotal = summaryDoc.data()?.sumMaterials + subtotal;
      const activityTotal = activityDoc.data()?.sumMaterials + subtotal;

      transaction.update(summaryRef, { sumMaterials: summaryTotal });
      transaction.update(activityRef, { sumMaterials: activityTotal });
      transaction.update(matRef, { updatedAt: serverTimestamp() });
      transaction.set(subMatRef, {
        ...rest,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return {
        ...budgetSubMaterial,
        id: subMatRef.id,
      } as ISubMaterial;
    });

    toastSuccess(appStrings.success, appStrings.saveSuccess);

    successCallback && successCallback(materialId, data.id);
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.saveError, errorMessage);

    errorCallback && errorCallback();
  }
};

export const updateBudgetSubMaterial = async ({
  projectId,
  activityId,
  materialId,
  budgetSubMaterial,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  activityId: string;
  materialId: string;
  budgetSubMaterial: ISubMaterial;
} & IService) => {
  try {
    await runTransaction(db, async transaction => {
      const { id, createdAt, ...rest } = budgetSubMaterial;
      const budgetRef = collection(db, 'projects', projectId, 'projectBudget');
      const matRef = doc(budgetRef, activityId, 'budgetMaterials', materialId);
      const subMatRef = doc(
        budgetRef,
        activityId,
        'budgetMaterials',
        materialId,
        'subMaterials',
        id,
      );
      const summaryRef = doc(budgetRef, 'summary');
      const activityRef = doc(budgetRef, activityId);
      const subMatDoc = await transaction.get(subMatRef);
      const summaryDoc = await transaction.get(summaryRef);
      const activityDoc = await transaction.get(activityRef);

      if (
        !subMatDoc.exists() ||
        !summaryDoc.exists() ||
        !activityDoc.exists()
      ) {
        throw Error(appStrings.noRecords);
      }

      const subtotal = rest.cost * rest.quantity;
      const oldSubtotal = subMatDoc.data()?.cost * subMatDoc.data()?.quantity;
      const newSum = subtotal - oldSubtotal;
      const summaryTotal = summaryDoc.data()?.sumMaterials + newSum;
      const activityTotal = activityDoc.data()?.sumMaterials + newSum;

      transaction.update(summaryRef, { sumMaterials: summaryTotal });
      transaction.update(activityRef, { sumMaterials: activityTotal });
      transaction.update(matRef, { updatedAt: serverTimestamp() });
      transaction.update(subMatRef, { ...rest, updatedAt: serverTimestamp() });
    });

    toastSuccess(appStrings.success, appStrings.saveSuccess);

    successCallback && successCallback(materialId, budgetSubMaterial.id);
  } catch (e) {
    errorCallback && errorCallback();
  }
};

export const deleteBudgetSubMaterial = async ({
  projectId,
  activityId,
  budgetMaterialId,
  budgetSubMaterialId,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  activityId: string;
  budgetMaterialId: string;
  budgetSubMaterialId: string;
} & IService) => {
  try {
    const budgetRef = collection(db, 'projects', projectId, 'projectBudget');
    const matRef = doc(
      budgetRef,
      activityId,
      'budgetMaterials',
      budgetMaterialId,
    );
    const subMatRef = doc(matRef, 'subMaterials', budgetSubMaterialId);
    const summaryRef = doc(budgetRef, 'summary');
    const activityRef = doc(budgetRef, activityId);
    const subMatDoc = await getDoc(subMatRef);
    const summaryDoc = await getDoc(summaryRef);
    const activityDoc = await getDoc(activityRef);

    if (!subMatDoc.exists() || !summaryDoc.exists() || !activityDoc.exists()) {
      throw Error(appStrings.noRecords);
    }

    const batch = writeBatch(db);

    const newSum = subMatDoc.data()?.cost * subMatDoc.data()?.quantity;
    const summaryTotal = summaryDoc.data()?.sumMaterials - newSum;
    const activityTotal = activityDoc.data()?.sumMaterials - newSum;

    batch.update(summaryRef, { sumMaterials: summaryTotal });
    batch.update(activityRef, { sumMaterials: activityTotal });
    batch.update(matRef, { updatedAt: serverTimestamp() });
    batch.delete(subMatRef);

    await batch.commit();

    toastSuccess(appStrings.success, appStrings.deleteSuccess);

    successCallback && successCallback();
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.deleteError, errorMessage);

    errorCallback && errorCallback();
  }
};
