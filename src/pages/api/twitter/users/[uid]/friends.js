import twitter from 'twitter';

export default async (req, res) => {
  const { uid } = req.query;
  const { access_token_key, access_token_secret } = req.body;
  const client = new twitter({
    consumer_key: process.env.TWITTER_API_KEY,
    consumer_secret: process.env.TWITTER_API_SECRET,
    access_token_key,
    access_token_secret,
  });

  try {
    const followersData = await client.get('/followers/list', { id: uid });

    const followers = followersData.users.map(user => ({
      uid: user.id_str,
    }));

    const followeesData = await client.get('/friends/list', { id: uid });

    const followees = followeesData.users.map(user => ({
      uid: user.id_str,
    }));

    const friendsOnTwitter = [...followers, ...followees];

    res.status(200).json({ friendsOnTwitter });
  } catch (e) {
    res.status(500).json({ error: 'Error fetching data from twitter api' });
  }
};
