import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';

firebase.initializeApp({
    apiKey: "AIzaSyBGo3Nqj9il9Cb31VHUUpxJY0nL9TUzEUY",
    authDomain: "crudapplication-cd467.firebaseapp.com",
    projectId: "crudapplication-cd467",
    storageBucket: "crudapplication-cd467.appspot.com",
    messagingSenderId: "370809190805",
    appId: "1:370809190805:web:e04c72e941b0b4b8e69e9c",
    measurementId: "G-E0EDQEJZ13"
});

const fb = firebase;

export default fb;

const storage = firebase.storage();
const storageRef = storage.ref();

export { storageRef };
