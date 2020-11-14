import firebaseAdmin, { dbAdmin } from '@/firebase/admin';
import twitter from 'twitter';

export default async (req, res) => {
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
};
