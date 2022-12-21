import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  fetchSignInMethodsForEmail,
  User,
} from 'firebase/auth';
import { query, where, collection, addDoc, getDocs } from 'firebase/firestore';
import { auth, db } from '../config/firebaseConfig';
import { login, logout } from '../redux/reducers/sessionSlice';
import { changeMaterials } from '../redux/reducers/materialsSlice';
import { getMaterials } from '../services/materialsService';
import { IMaterialBreakdown } from '../types/collections';

export const verifyEmail = async (email: string): Promise<String | null> => {
  try {
    const result = await fetchSignInMethodsForEmail(auth, email);
    console.log(result);
    if (!result.length) {
      return Error('La direccion de correo electronico no exite') + '';
    } else if (result[0] === 'google.com') {
      return Error('Debe iniciar seccion con Google') + '';
    }
    return null;
  } catch (error) {
    return error + '';
  }
};

export const logIn = async (
  email: string,
  password: string,
): Promise<[String | null, User | null]> => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    console.log(userCredential.user);
    return [null, userCredential.user];
  } catch (error) {
    return [error + '', null];
  }
};

export const signUp = async (email: string, password: string) => {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;
    await addDoc(collection(db, 'users'), {
      uid: user.uid,
      authProvider: 'local',
      email,
    });
    return [null, user];
  } catch (error) {
    return [error, null];
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
        dispatch(changeMaterials(response.map(m => m.material)));
      await getMaterials({ appStrings, successCallback });
    } else {
      dispatch(logout());
    }
  });
};
