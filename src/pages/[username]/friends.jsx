import { useEffect } from 'react';
import { dbAdmin } from '@/firebase/admin';
import { useRecoilValue } from 'recoil';
import { loginUserState } from '@/recoil/atoms';
import FriendList from '@/components/FriendList';

const Friends = ({ friendListOwner, friendListOwnerFriends }) => {
  const loginUser = useRecoilValue(loginUserState);

  useEffect(() => {
    console.log('hoge');
    if (loginUser && loginUser.uid === friendListOwner.uid) {
      fetch(`/api/firestore/users/${loginUser.uid}/readNotification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'newEntry' }),
      });
    }
  }, [friendListOwner, loginUser]);

  if (!friendListOwner) {
    return <p>ユーザーが存在しません</p>;
  }

  return (
    <>
      <p>{friendListOwner.displayName}さんの友達</p>
      <FriendList friends={friendListOwnerFriends} />
    </>
  );
};

export const getServerSideProps = async ctx => {
  const { username } = ctx.query;

  const friendListOwner = await dbAdmin
    .collection('users')
    .where('username', '==', username)
    .get()
    .then(snapshot => {
      let data;
      snapshot.forEach(doc => {
        data = doc.data();
      });
      return data;
    });

  if (!friendListOwner) {
    return {
      props: {
        friendListOwner: null,
      },
    };
  }

  const friendListOwnerFriends = await dbAdmin
    .collection('users')
    .doc(friendListOwner.uid)
    .collection('friends')
    .get()
    .then(snapshot => {
      let data = [];
      snapshot.forEach(doc => data.push(doc.data()));
      return data;
    });

  return {
    props: {
      friendListOwner,
      friendListOwnerFriends,
    },
  };
};

export default Friends;
