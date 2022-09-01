import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
} from 'firebase/auth';
import { query, where, collection, addDoc, getDocs } from 'firebase/firestore';
import { auth, db } from '../config/firebaseConfig';

export const verifyEmail = async (email: string): Promise<String | null> => {
  try {
    const userRef = collection(db, 'users');
    const result = await getDocs(query(userRef, where('email', '==', email)));
    if (result.empty) {
      return Error('La direccion de correo electronico no exite') + '';
    }
    return null;
  } catch (error) {
    return error + '';
  }
};

export const logIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    console.log(userCredential.user);
    return [null, userCredential.user];
  } catch (error) {
    return [error, null];
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
    return [null, result];
  } catch (error) {
    return [error, null];
  }
};

export const logOut = async () => {
  return await signOut(auth);
};

export const handleAuthChange = () => {
  onAuthStateChanged(auth, user => {
    if (user) {
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/firebase.User
      // ...
    } else {
      // User is signed out
      // ...
    }
  });
};
