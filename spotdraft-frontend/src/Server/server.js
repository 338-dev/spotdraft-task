import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAPQRKPxHamGWBRYpdXMOFCgS_29cgbg_I",
  authDomain: "filekeeper-34cc2.firebaseapp.com",
  projectId: "filekeeper-34cc2",
  storageBucket: "filekeeper-34cc2.appspot.com",
  messagingSenderId: "211656052208",
  appId: "1:211656052208:web:04b1207864e0a4ccf16135",
  measurementId: "G-B29E040WG3"
};

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
