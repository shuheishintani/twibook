import { dbAdmin } from '@/firebase/admin';

export default async (req, res) => {
  if (req.method === 'POST') {
    const { uid } = req.query;
    const { book } = req.body;
    const batch = dbAdmin.batch();

    const usersRef = dbAdmin.collection('users');
    const actionUserRef = usersRef.doc(uid);
    const actionUser = await actionUserRef.get().then(doc => doc.data());

    const subscribers = await actionUserRef
      .collection('subscribedBy')
      .get()
      .then(snapshot => {
        let subscribers = [];
        snapshot.forEach(doc => {
          subscribers.push(doc.data());
        });
        return subscribers;
      });

    subscribers.forEach(subscriber => {
      const subscriberNotificationRef = usersRef
        .doc(subscriber.uid)
        .collection('notifications')
        .doc();

      batch.set(subscriberNotificationRef, {
        id: subscriberNotificationRef.id,
        type: 'addBook',
        message: `${actionUser.displayName}さんが${book.author}『${book.title}』(${book.publisherName})を追加しました`,
        book,
        unread: true,
        createdBy: actionUser,
        createdAt: Date.now(),
      });
    });

    batch.commit();

    res.status(200).end();
  }

  if (req.method === 'PATCH') {
    const { uid } = req.query;
    const batch = dbAdmin.batch();

    const unreadNotificationsSnapshot = await dbAdmin
      .doc(`users/${uid}`)
      .collection('notifications')
      .where('unread', '==', true)
      .get();

    if (unreadNotificationsSnapshot.docs.length === 0) {
      res.end();
    }

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
