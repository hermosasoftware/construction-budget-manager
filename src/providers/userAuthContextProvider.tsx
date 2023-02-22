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
import { getMaterials } from '../services/materialsService';
import { IService } from '../types/service';
import { toastError, toastSuccess } from '../utils/toast';
import { IMaterialBreakdown } from '../types/collections';

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
  onAuthStateChanged(auth, async userAuth => {
    if (userAuth) {
      // user is logged in, send the user's details to redux, store the current user in the state
      dispatch(
        login({
          email: userAuth.email,
          uid: userAuth.uid,
          name: userAuth.displayName,
          // photoUrl: userAuth.photoURL,
        }),
      );
      const successCallback = (response: IMaterialBreakdown[]) =>
        dispatch(changeMaterials(response));
      await getMaterials({ appStrings, successCallback });
    } else {
      dispatch(logout());
    }
  });
};
