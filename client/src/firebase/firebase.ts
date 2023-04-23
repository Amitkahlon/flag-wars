// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getDatabase } from 'firebase/database'

import { onAuthStateChanged } from 'firebase/auth'

// Your web app's Firebase configuration, replace it with your project keys
const firebaseConfig = {
    apiKey: 'AIzaSyAhSF1YrtQkle86dAPFIkG_5TM-s9bGZ50',
    authDomain: 'flagswar-2576b.firebaseapp.com',
    databaseURL: 'https://flagswar-2576b-default-rtdb.firebaseio.com',
    projectId: 'flagswar-2576b',
    storageBucket: 'flagswar-2576b.appspot.com',
    messagingSenderId: '292038388087',
    appId: '1:292038388087:web:ba4363a767c6411fc05972',
    i: process.env.REACT_APP_FIREBASE_APP_ID,
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app)
export const DB = getFirestore(app)
export const realTimeDb = getDatabase(app)

