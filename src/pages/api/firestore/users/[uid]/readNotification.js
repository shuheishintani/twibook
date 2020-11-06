import { dbAdmin } from '@/firebase/admin';

export default async (req, res) => {
  const { uid } = req.query;
  const batch = dbAdmin.batch();

  const snapshot = await dbAdmin
    .doc(`users/${uid}`)
    .collection('notifications')
    .where('unread', '==', true)
    .get();

  const unreadNotificationIds = snapshot.docs.map(doc => doc.data().id);

  unreadNotificationIds.forEach(unreadNotificationId => {
    const unreadNotificationRef = dbAdmin.doc(
      `/users/${uid}/notifications/${unreadNotificationId}`
    );

    batch.set(
      unreadNotificationRef,
      {
        unread: false,
      },
      { merge: true }
    );
  });

  batch.commit();

  res.status(200).end();
};
