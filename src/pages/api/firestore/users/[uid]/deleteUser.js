import { dbAdmin } from '@/firebase/admin';

export default async (req, res) => {
  const { uid } = req.query;

  const userRef = dbAdmin.doc(`users/${uid}`);

  await execute(batch => {
    batch.delete(userRef);
  });

  const deleteUserBooksCollectionRef = userRef.collection('books');
  const deleteUserFriendsCollectionRef = userRef.collection('friends');
  const deleteUserSubscribeCollectionRef = userRef.collection('subscribe');
  const deleteUserSubscribedByCollectionRef = userRef.collection(
    'subscribedBy'
  );
  const deleteUserNotificationsCollectionRef = userRef.collection(
    'notifications'
  );

  const relatedFriendsCollectionRef = dbAdmin
    .collectionGroup('friends')
    .where('uid', '==', uid);
  const relatedSubscribeCollectionRef = dbAdmin
    .collectionGroup('subscribe')
    .where('uid', '==', uid);
  const relatedSubscribedByCollectionRef = dbAdmin
    .collectionGroup('subscribedBy')
    .where('uid', '==', uid);

  await deleteCollection(deleteUserBooksCollectionRef);
  await deleteCollection(deleteUserFriendsCollectionRef);
  await deleteCollection(deleteUserSubscribeCollectionRef);
  await deleteCollection(deleteUserSubscribedByCollectionRef);
  await deleteCollection(deleteUserNotificationsCollectionRef);
  await deleteCollection(relatedFriendsCollectionRef);
  await deleteCollection(relatedSubscribeCollectionRef);
  await deleteCollection(relatedSubscribedByCollectionRef);

  res.status(200).end();
};

const deleteCollection = async (collectionRef, batchSize = 500) => {
  const query = collectionRef.limit(batchSize);
  await deleteQueryBatch(dbAdmin, query, batchSize);
};

const deleteQueryBatch = async (firestore, query, batchSize) => {
  const snapshot = await query.get();

  if (snapshot.size === 0) {
    return;
  }

  const results = await execute(async batch => {
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
  });

  console.log(`deleted count: ${results.length}`);

  return await deleteQueryBatch(firestore, query, batchSize);
};

const execute = async f => {
  const batch = dbAdmin.batch();
  await f(batch);
  return await batch.commit();
};
