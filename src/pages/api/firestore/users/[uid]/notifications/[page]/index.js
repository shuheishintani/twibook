import { dbAdmin } from '@/firebase/admin';

export default async (req, res) => {
  if (req.method === 'GET') {
    const { uid, page } = req.query;

    const notifications = await dbAdmin
      .doc(`/users/${uid}`)
      .collection('notifications')
      .orderBy('createdAt', 'desc')
      .limit(30)
      .offset((page - 1) * 30)
      .get()
      .then(snapshot => snapshot.docs.map(doc => doc.data()));

    res.status(200).json({ notifications });
  }
};
