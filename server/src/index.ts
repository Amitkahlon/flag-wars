import express from 'express';
const cors = require('cors');

import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

import admin from 'firebase-admin';
import { registerControllers } from './controllers/registerControllers';
import { getDatabase } from 'firebase-admin/database';

var serviceAccount = require('../flagswar-2576b-firebase-adminsdk-l3z5a-7109daaf8a.json');

const firebaseApp = initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://flagswar-2576b-default-rtdb.firebaseio.com',
});

export const auth = admin.auth();
export const firestoreDb = getFirestore(firebaseApp);
export const firebaseDb = getDatabase(firebaseApp);

export const app = express();

app.use(
  cors({
    origin: '*',
  }),
);

app.use(
  express.urlencoded({
    extended: true,
  }),
);

app.use(express.json());

registerControllers();

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.listen(3001, () => {
  console.log('Server listening on port 3000');
});


