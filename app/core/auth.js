import { auth, db } from "../../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  getAuth,
  onAuthStateChanged
} from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
export async function createAccount(email, password) {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);

    await setDoc(doc(database, "users", result.user.uid), {
      name: "",
      profileCompleted: false,
      createdAt: new Date(),
    });

    await sendEmailVerification(result.user);
    return result;

  } catch (error) {
    console.log(error);
    throw error;
  }
}
 
export async function login(email, password) {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.log(error);
    throw error;
  }
}
 
export async function logout() {
  try {
    await signOut(auth);
    
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function resetEmail(email) {
  try {
    await sendPasswordResetEmail(auth, email);
    alert("Reset email sent");
  } catch (error) {
    console.log(error);
    throw error;
  }
}


export function listenToAuthChanges(callback) {
  return onAuthStateChanged(auth, callback);
}


export function getCurrentUser() {
  const auth=getAuth();
 
  return auth.currentUser;
}