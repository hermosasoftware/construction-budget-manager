import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  runTransaction,
  writeBatch,
  FirestoreError,
  onSnapshot,
  orderBy,
  updateDoc,
} from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { db } from '../config/firebaseConfig';
import { IBudgetMaterial } from '../types/budgetMaterial';
import { IService } from '../types/service';
import { toastSuccess, toastError } from '../utils/toast';
import { IMaterialBreakdown, ISubMaterial } from '../types/collections';
import {
  changeExtraMaterials,
  insertExtraMaterial,
  modifyExtraMaterial,
  removeExtraMaterial,
} from '../redux/reducers/extraMaterialsSlice';
import { store } from '../redux/store';
import { listenersList } from './herperService';

export const listenExtraMaterials = ({
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
      'projectExtraBudget',
      activityId,
      'budgetMaterials',
    );
    const matQuery = query(matRef, orderBy('name', 'desc'));
    const { dispatch, getState } = store;

    const unsubscribe = onSnapshot(
      matQuery,
      { includeMetadataChanges: true },
      querySnapshot => {
        let materialsList = [...getState().extraMaterials.extraMaterials];

        const projectOrders: any = querySnapshot
          .docChanges({ includeMetadataChanges: true })
          .map(async change => {
            const elem = {
              ...change.doc.data(),
              id: change.doc.id,
              subtotal: change.doc.data().cost * change.doc.data().quantity,
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

        Promise.all(projectOrders).then(result => {
          result.flat().length && dispatch(changeExtraMaterials(result));
        });
      },
      error => {
        const index = listenersList.findIndex(e => e.name === 'extraMaterials');
        if (index !== -1) {
          listenersList.splice(index, 1);
          dispatch(changeExtraMaterials([]));
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
  const subMaterialQ = query(collection(matRef, elem.id, 'subMaterials'));
  const subMaterials = await getDocs(subMaterialQ);
  const data = subMaterials.docs.map(doc => ({
    ...doc.data(),
    id: doc.id,
  })) as ISubMaterial[];

  if (materialsList.length > 0) {
    dispatch(
      insertExtraMaterial({
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
  const subMaterialQ = query(collection(matRef, elem.id, 'subMaterials'));
  const subMaterials = await getDocs(subMaterialQ);
  const data = subMaterials.docs.map(doc => ({
    ...doc.data(),
    id: doc.id,
  })) as ISubMaterial[];
  dispatch(
    modifyExtraMaterial({
      id: elem.id,
      material: elem,
      subMaterials: data,
    }),
  );
  return [];
};

const changeTypeRemoved = async (dispatch: any, elem: IBudgetMaterial) => {
  dispatch(
    removeExtraMaterial({
      id: elem.id,
      material: elem,
      subMaterials: [],
    }),
  );
  return [];
};

export const getExtraBudgetMaterials = async ({
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
      'projectExtraBudget',
      activityId,
      'budgetMaterials',
    );
    const result = await getDocs(matRef);
    const data = result.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      subtotal: doc.data().cost * doc.data().quantity,
    })) as IBudgetMaterial[];

    let allMaterials = null;
    let submaterialsPromise = data.map(async elem => {
      const materialQ = query(
        collection(
          db,
          'projects',
          projectId,
          'projectExtraBudget',
          activityId,
          'budgetMaterials',
          elem.id,
          'subMaterials',
        ),
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

export const getExtraBudgetMaterialById = async ({
  projectId,
  activityId,
  extraBudgetMaterialId,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  activityId: string;
  extraBudgetMaterialId: string;
} & IService) => {
  try {
    const matRef = doc(
      db,
      'projects',
      projectId,
      'projectExtraBudget',
      activityId,
      'budgetMaterials',
      extraBudgetMaterialId,
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

export const createExtraBudgetMaterial = async ({
  projectId,
  activityId,
  extraBudgetMaterial,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  activityId: string;
  extraBudgetMaterial: IBudgetMaterial;
} & IService) => {
  try {
    const data = await runTransaction(db, async transaction => {
      const { id, subtotal, subMaterials, ...rest } = extraBudgetMaterial;
      const budgetRef = collection(
        db,
        'projects',
        projectId,
        'projectExtraBudget',
      );
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
          batch.set(doc(matRef, 'subMaterials', id), rest);
          subMatSubtotal += rest.cost * rest.quantity;
        });
        summaryTotal += subMatSubtotal * rest.quantity;
        activityTotal += subMatSubtotal * rest.quantity;
      } else {
        summaryTotal += subtotal;
        activityTotal += subtotal;
      }

      transaction.update(summaryRef, { sumMaterials: summaryTotal });
      transaction.update(activityRef, { sumMaterials: activityTotal });
      transaction.set(matRef, rest);

      await batch.commit();

      return {
        ...extraBudgetMaterial,
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

export const updateExtraBudgetMaterial = async ({
  projectId,
  activityId,
  extraBudgetMaterial,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  activityId: string;
  extraBudgetMaterial: IBudgetMaterial;
} & IService) => {
  try {
    await runTransaction(db, async transaction => {
      const { id, subtotal, subMaterials, ...rest } = extraBudgetMaterial;
      const budgetRef = collection(
        db,
        'projects',
        projectId,
        'projectExtraBudget',
      );
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
      if (matDoc.data()?.hasSubMaterials && rest.hasSubMaterials) {
        subMaterials?.forEach(m => (subMatSubtotal += m.cost * m.quantity));
        newSum =
          subMatSubtotal * rest.quantity -
          subMatSubtotal * matDoc.data()?.quantity;
      } else if (!matDoc.data()?.hasSubMaterials && rest.hasSubMaterials) {
        subMaterials?.forEach(m => (subMatSubtotal += m.cost * m.quantity));
        newSum =
          subMatSubtotal * rest.quantity -
          matDoc.data()?.cost * matDoc.data()?.quantity;
      } else if (matDoc.data()?.hasSubMaterials && !rest.hasSubMaterials) {
        subMaterials?.forEach(m => (subMatSubtotal += m.cost * m.quantity));
        newSum =
          rest.cost * rest.quantity - subMatSubtotal * matDoc.data()?.quantity;
      } else {
        newSum = subtotal - matDoc.data()?.cost * matDoc.data()?.quantity;
      }

      const summaryTotal = summaryDoc.data()?.sumMaterials + newSum;
      const activityTotal = activityDoc.data()?.sumMaterials + newSum;

      transaction.update(summaryRef, { sumMaterials: summaryTotal });
      transaction.update(activityRef, { sumMaterials: activityTotal });
      transaction.set(matRef, rest);
    });

    toastSuccess(appStrings.success, appStrings.saveSuccess);

    successCallback && successCallback(extraBudgetMaterial);
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.saveError, errorMessage);

    errorCallback && errorCallback();
  }
};

export const deleteExtraBudgetMaterial = async ({
  projectId,
  activityId,
  extraBudgetMaterialId,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  activityId: string;
  extraBudgetMaterialId: string;
} & IService) => {
  try {
    const budgetRef = collection(
      db,
      'projects',
      projectId,
      'projectExtraBudget',
    );
    const matRef = doc(
      budgetRef,
      activityId,
      'budgetMaterials',
      extraBudgetMaterialId,
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
      newSum *= matDoc.data()?.quantity;
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

    toastSuccess(appStrings.success, appStrings.saveSuccess);

    successCallback && successCallback();
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.deleteError, errorMessage);

    errorCallback && errorCallback();
  }
};

export const createExtraBudgetSubMaterial = async ({
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
    const { id, ...rest } = budgetSubMaterial;
    const budgetRef = collection(
      db,
      'projects',
      projectId,
      'projectExtraBudget',
    );
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
    const data = await runTransaction(db, async transaction => {
      const summaryRef = doc(budgetRef, 'summary');
      const activityRef = doc(budgetRef, activityId);
      const matDoc = await transaction.get(matRef);
      const summaryDoc = await transaction.get(summaryRef);
      const activityDoc = await transaction.get(activityRef);

      if (!summaryDoc.exists() || !activityDoc.exists() || !matDoc.exists()) {
        throw Error(appStrings.noRecords);
      }
      const subtotal = rest.cost * rest.quantity * matDoc.data()?.quantity;
      const summaryTotal = summaryDoc.data()?.sumMaterials + subtotal;
      const activityTotal = activityDoc.data()?.sumMaterials + subtotal;

      transaction.update(summaryRef, { sumMaterials: summaryTotal });
      transaction.update(activityRef, { sumMaterials: activityTotal });
      transaction.set(subMatRef, rest);

      return {
        ...budgetSubMaterial,
        id: subMatRef.id,
      } as ISubMaterial;
    });
    await updateDoc(matRef, {});

    toastSuccess(appStrings.success, appStrings.saveSuccess);

    successCallback && successCallback(materialId, data.id);
  } catch (error) {
    let errorMessage = appStrings.genericError;
    if (error instanceof FirebaseError) errorMessage = error.message;

    toastError(appStrings.saveError, errorMessage);

    errorCallback && errorCallback();
  }
};

export const updateExtraBudgetSubMaterial = async ({
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
    const { id, ...rest } = budgetSubMaterial;
    const budgetRef = collection(
      db,
      'projects',
      projectId,
      'projectExtraBudget',
    );
    const matRef = doc(budgetRef, activityId, 'budgetMaterials', materialId);
    const subMatRef = doc(
      budgetRef,
      activityId,
      'budgetMaterials',
      materialId,
      'subMaterials',
      id,
    );
    await runTransaction(db, async transaction => {
      const summaryRef = doc(budgetRef, 'summary');
      const activityRef = doc(budgetRef, activityId);
      const matDoc = await transaction.get(matRef);
      const subMatDoc = await transaction.get(subMatRef);
      const summaryDoc = await transaction.get(summaryRef);
      const activityDoc = await transaction.get(activityRef);

      if (
        !matDoc.exists() ||
        !subMatDoc.exists() ||
        !summaryDoc.exists() ||
        !activityDoc.exists()
      ) {
        throw Error(appStrings.noRecords);
      }

      const subtotal = rest.cost * rest.quantity * matDoc.data()?.quantity;
      const oldSubtotal =
        subMatDoc.data()?.cost *
        subMatDoc.data()?.quantity *
        matDoc.data()?.quantity;
      const newSum = subtotal - oldSubtotal;
      const summaryTotal = summaryDoc.data()?.sumMaterials + newSum;
      const activityTotal = activityDoc.data()?.sumMaterials + newSum;

      transaction.update(summaryRef, { sumMaterials: summaryTotal });
      transaction.update(activityRef, { sumMaterials: activityTotal });
      transaction.set(subMatRef, rest);
    });
    await updateDoc(matRef, {});

    toastSuccess(appStrings.success, appStrings.saveSuccess);

    successCallback && successCallback(materialId, budgetSubMaterial.id);
  } catch (e) {
    errorCallback && errorCallback();
  }
};

export const deleteExtraBudgetSubMaterial = async ({
  projectId,
  activityId,
  extraBudgetMaterialId,
  extraBudgetSubMaterialId,
  appStrings,
  successCallback,
  errorCallback,
}: {
  projectId: string;
  activityId: string;
  extraBudgetMaterialId: string;
  extraBudgetSubMaterialId: string;
} & IService) => {
  try {
    const budgetRef = collection(
      db,
      'projects',
      projectId,
      'projectExtraBudget',
    );
    const matRef = doc(
      budgetRef,
      activityId,
      'budgetMaterials',
      extraBudgetMaterialId,
    );
    const subMatRef = doc(matRef, 'subMaterials', extraBudgetSubMaterialId);
    const summaryRef = doc(budgetRef, 'summary');
    const activityRef = doc(budgetRef, activityId);
    const matDoc = await getDoc(matRef);
    const subMatDoc = await getDoc(subMatRef);
    const summaryDoc = await getDoc(summaryRef);
    const activityDoc = await getDoc(activityRef);

    if (
      !matDoc.exists() ||
      !subMatDoc.exists() ||
      !summaryDoc.exists() ||
      !activityDoc.exists()
    ) {
      throw Error(appStrings.noRecords);
    }

    const batch = writeBatch(db);

    const newSum =
      subMatDoc.data()?.cost *
      subMatDoc.data()?.quantity *
      matDoc.data()?.quantity;
    const summaryTotal = summaryDoc.data()?.sumMaterials - newSum;
    const activityTotal = activityDoc.data()?.sumMaterials - newSum;

    batch.update(summaryRef, { sumMaterials: summaryTotal });
    batch.update(activityRef, { sumMaterials: activityTotal });
    batch.delete(subMatRef);
    batch.update(matRef, {});

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
