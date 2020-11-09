import { useEffect } from 'react';
import { auth } from '@/firebase/client';
import { useRecoilState, useRecoilValue } from 'recoil';
import { loginUserState, loginUserBooksState } from '@/recoil/atoms';
import { useRouter } from 'next/router';
import { Button, Box, Avatar, Typography } from '@material-ui/core';

const Profile = () => {
  const router = useRouter();
  const [loginUser, setLoginUser] = useRecoilState(loginUserState);
  const loginUserBooks = useRecoilValue(loginUserBooksState);

  useEffect(() => {
    if (!loginUser) {
      router.push('/');
    }
  }, [loginUser, router]);

  const deleteUser = async () => {
    if (loginUser && loginUser.uid === loginUser.uid) {
      await fetch(`/api/firestore/users/${loginUser.uid}/deleteUser`).then(
        () => {
          router.push('/');
        }
      );
      await auth.currentUser.delete();
      setLoginUser(null);
    }
  };

  if (!loginUser) {
    return <p>ユーザーが存在しません</p>;
  }

  return (
    <>
      <Box flexGrow={1}>
        <Box display="flex" alignItems="flex-end">
          <Avatar alt="profile-img" src={loginUser.profileImageUrl} />
          <Box m={1} />
          <Typography variant="subtitle1">
            {loginUser.displayName}さんのプロフィール
          </Typography>
          <Box m={1} />
        </Box>
      </Box>
      <Box m={3} />
      <Typography variant="subtitle2">
        登録している本の数: {loginUserBooks.length}冊
      </Typography>
      <Box m={3} />
      <Button variant="outlined" color="secondary" onClick={deleteUser}>
        アカウントを削除する
      </Button>
    </>
  );
};

export default Profile;
