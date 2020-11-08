import { useEffect } from 'react';
import { dbAdmin } from '@/firebase/admin';
import { auth } from '@/firebase/client';
import { useRecoilState } from 'recoil';
import { loginUserState } from '@/recoil/atoms';
import { useRouter } from 'next/router';
import { Button } from '@material-ui/core';

const Profile = ({ profileOwner, profileOwnerBooks }) => {
  const router = useRouter();
  const [loginUser, setLoginUser] = useRecoilState(loginUserState);

  useEffect(() => {
    if (!loginUser) {
      router.push('/');
    }
  }, [loginUser, router]);

  const deleteUser = async () => {
    if (loginUser && loginUser.uid === profileOwner.uid) {
      await fetch(`/api/firestore/users/${loginUser.uid}/deleteUser`).then(
        () => {
          router.push('/');
        }
      );
      await auth.currentUser.delete();
      setLoginUser(null);
    }
  };

  if (!profileOwner) {
    return <p>ユーザーが存在しません</p>;
  }

  return (
    <>
      <p>{profileOwner.displayName}さんのプロフィール</p>
      <p>登録している本の数: {profileOwnerBooks.length}冊</p>
      <Button variant="outlined" color="secondary" onClick={deleteUser}>
        アカウントを削除する
      </Button>
    </>
  );
};

export const getServerSideProps = async ctx => {
  const { username } = ctx.query;

  const profileOwner = await dbAdmin
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

  if (!profileOwner) {
    return {
      props: {
        profileOwner: null,
      },
    };
  }

  const profileOwnerBooks = await dbAdmin
    .collection('users')
    .doc(profileOwner.uid)
    .collection('books')
    .get()
    .then(snapshot => {
      let data = [];
      snapshot.forEach(doc => data.push(doc.data()));
      return data;
    });

  return {
    props: {
      profileOwner,
      profileOwnerBooks,
    },
  };
};

export default Profile;
