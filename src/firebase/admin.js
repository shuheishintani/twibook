import firebaseAdmin from 'firebase-admin';

import serviceAccount from './secret.json';

if (firebaseAdmin.apps.length === 0) {
  firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount),
    databaseURL: 'https://twibook-c1f70.firebaseio.com',
  });
}

export default firebaseAdmin;
export const dbAdmin = firebaseAdmin.firestore();
export const authAdmin = firebaseAdmin.auth();
