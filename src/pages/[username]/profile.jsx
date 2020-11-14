import { useState, useEffect } from 'react';
import { db } from '@/firebase/client';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { loginUserState, loginUserBooksState } from '@/recoil/atoms';
import { Box, Avatar, Typography } from '@material-ui/core';

const Profile = () => {
  const [loginUser, setLoginUser] = useRecoilState(loginUserState);

  if (!loginUser) {
    return (
      <>
        <p>ユーザーが存在しません</p>
      </>
    );
  }

  return (
    <>
      <Box flexGrow={1}>
        {/* <Box display="flex" alignItems="flex-end">
          <Avatar alt="profile-img" src={loginUser.profileImageUrl} />
          <Box m={1} />
          <Typography variant="subtitle1">
            {loginUser.displayName}さんのプロフィール
          </Typography>
          <Box m={1} />
        </Box>
        <Box m={3} /> */}
        <Typography variant="subtitle2">実装中です</Typography>
      </Box>
      <Box m={3} />
      <Box m={3} />
    </>
  );
};

export default Profile;
