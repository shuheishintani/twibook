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

    const followersData = await client.get('/followers/list', {
      id: loginUser.uid,
    });

    const followers = followersData.users.map(user => ({
      uid: user.id_str,
    }));

    const followeesData = await client.get('/friends/list', {
      id: loginUser.uid,
    });

    const followees = followeesData.users.map(user => ({
      uid: user.id_str,
    }));

    const friendsOnTwitter = [...followers, ...followees];

    const allUserIds = await dbAdmin
      .collection('users')
      .get()
      .then(snapshot => snapshot.docs.map(doc => doc.data().uid));

    const friends = friendsOnTwitter.filter(friendOnTwitter => {
      return allUserIds.some(userId => userId === friendOnTwitter.uid);
    });

    const batch = dbAdmin.batch();

    const usersRef = dbAdmin.collection('users');
    const loginUserRef = usersRef.doc(loginUser.uid);
    const loginUserFriendsRef = loginUserRef.collection('friends');

    const newEntry = allUserIds.every(userId => userId !== loginUser.uid);

    if (newEntry) {
      batch.set(loginUserRef, loginUser);
    } else {
      batch.set(loginUserRef, loginUser, { merge: true });
    }

    friends.forEach(friend => {
      const loginUserFriendRef = loginUserFriendsRef.doc(friend.uid);
      const friendFriendsRef = usersRef
        .doc(friend.uid)
        .collection('friends')
        .doc(loginUser.uid);

      batch.set(loginUserFriendRef, friend, { merge: true });

      const friendNotificationRef = usersRef
        .doc(friend.uid)
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
        batch.set(friendFriendsRef, {
          uid: loginUser.uid,
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
