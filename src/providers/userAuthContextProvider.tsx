import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  fetchSignInMethodsForEmail,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { query, where, collection, addDoc, getDocs } from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { auth, db } from '../config/firebaseConfig';
import { login, logout } from '../redux/reducers/sessionSlice';
import { changeMaterials } from '../redux/reducers/materialsSlice';
import { listenMaterials } from '../services/materialsService';
import { IService } from '../types/service';
import { toastError, toastSuccess } from '../utils/toast';
import { listenProjects } from '../services/ProjectService';
import { changeProjects } from '../redux/reducers/projectsSlice';
import { listenersList } from '../services/herperService';
import { changeProjectOrders } from '../redux/reducers/projectOrdersSlice';
import { changeProjectInvoices } from '../redux/reducers/projectInvoicesSlice';
import { changeProjectExpenses } from '../redux/reducers/projectExpensesSlice';
import { clearProjectBudget } from '../redux/reducers/projectBudgetSlice';
import { clearProjectExtraBudget } from '../redux/reducers/projectExtraBudgetSlice';
import { changeBudgetLabors } from '../redux/reducers/budgetLaborsSlice';
import { changeBudgetSubcontracts } from '../redux/reducers/budgetSubcontractsSlice';
import { changeBudgetOthers } from '../redux/reducers/budgetOthersSlice';
import { changeExtraActivities } from '../redux/reducers/extraActivitiesSlice';
import { changeBudgetActivities } from '../redux/reducers/budgetActivitiesSlice';
import { changeExtraMaterials } from '../redux/reducers/extraMaterialsSlice';
import { changeExtraLabors } from '../redux/reducers/extraLaborsSlice';
import { changeExtraSubcontracts } from '../redux/reducers/extraSubcontractsSlice';
import { changeExtraOthers } from '../redux/reducers/extraOthersSlice';
import { getUserByUID } from '../services/UserService';
import { IUser } from '../types/user';
import { store } from '../redux/store';

export const verifyEmail = async ({
  email,
  appStrings,
  successCallback,
  errorCallback,
}: { email: string } & IService) => {
  try {
    const result = await fetchSignInMethodsForEmail(auth, email);

    if (!result.length) throw Error(appStrings.emailNotExist);

    successCallback && successCallback();
  } catch (error) {
    let errorMessage = appStrings.genericError;

    if (error instanceof FirebaseError) {
      errorMessage = appStrings[error.code];
    } else if (
      error instanceof Error &&
      error.message === appStrings.emailNotExist
    ) {
      errorMessage = error.message;
    }

    toastError(appStrings.errorWhileLogIn, errorMessage);

    errorCallback && errorCallback();
  }
};

export const logIn = async ({
  email,
  password,
  appStrings,
  successCallback,
  errorCallback,
}: { email: string; password: string } & IService) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    successCallback && successCallback(userCredential.user);
  } catch (error) {
    let errorMessage = appStrings.genericError;

    if (error instanceof FirebaseError) errorMessage = appStrings[error.code];

    toastError(appStrings.errorWhileLogIn, errorMessage);

    errorCallback && errorCallback();
  }
};

export const passwordResetEmail = async ({
  email,
  appStrings,
  successCallback,
  errorCallback,
}: { email: string } & IService) => {
  try {
    verifyEmail({
      email,
      appStrings,
      successCallback: async () => {
        await sendPasswordResetEmail(auth, email);
        toastSuccess(
          appStrings.success,
          `${appStrings.passwordResetEmail} ${email}`,
        );

        successCallback && successCallback();
      },
    });
  } catch (error) {
    let errorMessage = appStrings.genericError;

    if (error instanceof FirebaseError) {
      errorMessage = appStrings[error.code];
    }

    toastError(appStrings.errorWhileLogIn, errorMessage);

    errorCallback && errorCallback();
  }
};

export const signUp = async ({
  email,
  password,
  appStrings,
  successCallback,
  errorCallback,
}: { email: string; password: string } & IService) => {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;
    await addDoc(collection(db, 'users'), {
      uid: user.uid,
      authProvider: 'local',
      email,
    });
    successCallback && successCallback(user);
  } catch (error) {
    let errorMessage = appStrings.genericError;

    if (error instanceof FirebaseError) errorMessage = appStrings[error.code];

    toastError(appStrings.errorWhileLogIn, errorMessage);

    errorCallback && errorCallback();
  }
};

export const googleSignIn = async () => {
  try {
    const googleAuthProvider = new GoogleAuthProvider();
    const res = await signInWithPopup(auth, googleAuthProvider);
    const user = res.user;
    const userRef = collection(db, 'users');
    const result = await getDocs(query(userRef, where('uid', '==', user.uid)));
    if (result.empty) {
      await addDoc(collection(db, 'users'), {
        uid: user.uid,
        name: user.displayName,
        authProvider: 'google',
        email: user.email,
      });
    }
    return [null, result.docs[0] as any];
  } catch (error) {
    return [error, null];
  }
};

export const logOut = async () => {
  return await signOut(auth);
};

export const handleAuthChange = (dispatch: Function, appStrings: any) => {
  onAuthStateChanged(auth, userAuth => {
    const user = store.getState().session.user;
    if (userAuth) {
      // user is logged in, send the user's details to redux, store the current user in the state
      const successCallback = (data: IUser) => {
        if (data.status) {
          dispatch(login(data));
          startListeners(appStrings);
        } else {
          toastError(
            appStrings.errorWhileLogIn,
            appStrings.userDisabledMessage,
          );
          logOut();
        }
      };
      !user &&
        getUserByUID({
          userUID: userAuth.uid,
          appStrings,
          successCallback,
        });
    } else {
      dispatch(logout());
      cleanListeners(dispatch);
    }
  });
};

const startListeners = async (appStrings: any) => {
  const successCallbackMaterials = (response: Function) => {
    listenersList.push({ name: 'globalMaterials', stop: response });
  };
  const successCallbackProjects = (response: Function) => {
    listenersList.push({ name: 'projects', stop: response });
  };
  listenMaterials({
    appStrings,
    successCallback: successCallbackMaterials,
  });
  listenProjects({
    appStrings,
    successCallback: successCallbackProjects,
  });
};

const cleanListeners = (dispatch: Function) => {
  listenersList.splice(0, listenersList.length);
  dispatch(changeMaterials([]));
  dispatch(changeProjects([]));
  dispatch(clearProjectBudget());
  dispatch(clearProjectExtraBudget());
  dispatch(changeProjectOrders([]));
  dispatch(changeProjectInvoices([]));
  dispatch(changeProjectExpenses([]));
  dispatch(changeBudgetActivities([]));
  dispatch(changeBudgetLabors([]));
  dispatch(changeBudgetSubcontracts([]));
  dispatch(changeBudgetOthers([]));
  dispatch(changeExtraActivities([]));
  dispatch(changeExtraMaterials([]));
  dispatch(changeExtraLabors([]));
  dispatch(changeExtraSubcontracts([]));
  dispatch(changeExtraOthers([]));
};
