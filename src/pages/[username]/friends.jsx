import { useState, useEffect } from 'react';
import { db } from '@/firebase/client';
import { dbAdmin } from '@/firebase/admin';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import FriendList from '@/components/FriendList';
import { Box, Avatar, Typography, CircularProgress } from '@material-ui/core';

const fetchFriendsByUid = async uid => {
  const snapshot = await db
    .collection('users')
    .doc(uid)
    .collection('friends')
    .get();

  return new Promise((resolve, reject) => {
    const friends = snapshot.docs.map(doc => doc.data());
    resolve({ friends });
  });
};

const Friends = ({ friendListOwner }) => {
  const [friends, setFriends] = useState([]);
  const router = useRouter();
  const { username } = router.query;
  const { data, error } = useSWR(`/${username}/friends`, () =>
    fetchFriendsByUid(friendListOwner.uid)
  );

  useEffect(() => {
    data && setFriends(data.friends);
  }, [data]);

  if (!friendListOwner) {
    return <p>ユーザーが存在しません</p>;
  }

  if (!data) {
    return <CircularProgress />;
  }

  if (error) {
    throw new Error(error);
  }

  return (
    <>
      {friends && (
        <>
          <Box flexGrow={1}>
            <Box display="flex" alignItems="flex-end">
              <Avatar alt="profile-img" src={friendListOwner.profileImageUrl} />
              <Box m={1} />
              <Typography variant="subtitle1">
                {friendListOwner.displayName}さんの友達
              </Typography>
              <Box m={1} />
            </Box>
          </Box>
          <Box m={3} />
          <FriendList friends={friends} />
        </>
      )}
    </>
  );
};

export const getStaticPaths = async () => {
  const usernameList = await dbAdmin
    .collection('users')
    .get()
    .then(snapshot => snapshot.docs.map(doc => doc.data().username));

  return {
    paths: usernameList.map(username => ({
      params: {
        username,
      },
    })),
    fallback: true,
  };
};

export const getStaticProps = async ({ params: { username } }) => {
  const snapshot = await dbAdmin
    .collection('users')
    .where('username', '==', username)
    .get();

  const friendListOwner =
    snapshot.docs.length !== 0 ? snapshot.docs[0].data() : null;

  return {
    props: {
      friendListOwner,
    },
    revalidate: 1,
  };
};

export default Friends;
