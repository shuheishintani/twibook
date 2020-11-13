import firebaseAdmin, { dbAdmin } from '@/firebase/admin';

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
};
