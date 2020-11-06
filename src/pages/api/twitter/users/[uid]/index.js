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
    const user = await client.get('/users', { id: uid });
    res.status(200).json({ user });
  } catch (e) {
    res.status(500).json({ error: 'Error fetching data from twitter api' });
  }
};
