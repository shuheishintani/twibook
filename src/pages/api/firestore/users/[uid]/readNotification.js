import { dbAdmin } from '@/firebase/admin';

export default async (req, res) => {
  if (req.method === 'PATCH') {
    const { uid } = req.query;
    const batch = dbAdmin.batch();

    const unreadNotificationsSnapshot = await dbAdmin
      .doc(`users/${uid}`)
      .collection('notifications')
      .where('unread', '==', true)
      .get();

    const unreadNotificationIds = unreadNotificationsSnapshot.docs.map(
      doc => doc.data().id
    );

    const selectedNotificationsSnapshot = await dbAdmin
      .doc(`users/${uid}`)
      .collection('notifications')
      .get();

    const selectedNotificationIds = selectedNotificationsSnapshot.docs.map(
      doc => doc.data().id
    );

    const unreadSelectedNotificatioinIds = unreadNotificationIds.filter(id =>
      selectedNotificationIds.includes(id)
    );

    unreadSelectedNotificatioinIds.forEach(id => {
      const unreadSelectedNotificationRef = dbAdmin.doc(
        `/users/${uid}/notifications/${id}`
      );

      batch.set(
        unreadSelectedNotificationRef,
        {
          unread: false,
        },
        { merge: true }
      );
    });

    batch.commit();

    res.status(200).end();
  }
};
