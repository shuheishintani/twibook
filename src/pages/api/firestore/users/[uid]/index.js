import { dbAdmin } from '@/firebase/admin';
import twitter from 'twitter';

export default async (req, res) => {
  if (req.method === 'POST') {
    const { loginUser, accessToken, secret } = req.body;
    const client = new twitter({
      consumer_key: process.env.TWITTER_API_KEY,
      consumer_secret: process.env.TWITTER_API_SECRET,
      access_token_key: accessToken,
      access_token_secret: secret,
    });

    const followers = await client.get('/followers/ids', {
      id: loginUser.uid,
      stringify_ids: true,
    });

    const followees = await client.get('/friends/ids', {
      id: loginUser.uid,
      stringify_ids: true,
    });

    const friendsOnTwitter = [...followers.ids, ...followees.ids];
    const dedupedFriendsOnTwitter = [...new Set(friendsOnTwitter)];

    const allUserIds = await dbAdmin
      .collection('users')
      .get()
      .then(snapshot => snapshot.docs.map(doc => doc.data().uid));

    const friendIds = dedupedFriendsOnTwitter.filter(friendOnTwitter => {
      return allUserIds.some(userId => userId === friendOnTwitter);
    });

    const batch = dbAdmin.batch();

    const usersRef = dbAdmin.collection('users');
    const loginUserRef = usersRef.doc(loginUser.uid);
    const loginUserFriendsRef = loginUserRef.collection('friends');

    const newEntry = allUserIds.every(userId => userId !== loginUser.uid);

    if (newEntry) {
      batch.set(loginUserRef, { ...loginUser, createdAt: Date.now() });
    } else {
      batch.set(loginUserRef, loginUser, { merge: true });
    }

    friendIds.forEach(friendId => {
      const loginUserFriendRef = loginUserFriendsRef.doc(friendId);

      const friendFriendsRef = usersRef
        .doc(friendId)
        .collection('friends')
        .doc(loginUser.uid);

      batch.set(friendFriendsRef, {
        uid: loginUser.uid,
      });

      batch.set(loginUserFriendRef, { uid: friendId }, { merge: true });

      const friendNotificationRef = usersRef
        .doc(friendId)
        .collection('notifications')
        .doc();

      if (newEntry) {
        batch.set(friendNotificationRef, {
          id: friendNotificationRef.id,
          type: 'newEntry',
          message: `${loginUser.displayName}さんが参加しました`,
          unread: true,
          createdBy: loginUser,
          createdAt: Date.now(),
        });
      }
    });

    await batch.commit();

    res.status(200).json({
      newEntry,
    });
  }

  if (req.method === 'DELETE') {
    const { uid } = req.query;

    const userRef = dbAdmin.doc(`users/${uid}`);

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
  }
};
