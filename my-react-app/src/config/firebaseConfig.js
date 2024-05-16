import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDlodufxD85YZO35-RX0qk3teTsMNV7kVE",
  authDomain: "final-band-o-bast.firebaseapp.com",
  databaseURL: "https://final-band-o-bast-default-rtdb.firebaseio.com",
  projectId: "final-band-o-bast",
  storageBucket: "final-band-o-bast.appspot.com",
  messagingSenderId: "927849336184",
  appId: "1:927849336184:web:f9b740fbe52003d7cfcc8d",
  measurementId: "G-NXZPRZF6ZP"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth =getAuth(app);
export const database =getAuth(app);

export { db , auth};
