import { useRecoilValue } from 'recoil';
import {
  loginUserState,
  loginUserBooksState,
  loginUserFriendsState,
  loginUserSubscribeState,
} from '@/recoil/atoms';
import { Box, Avatar, Typography } from '@material-ui/core';
import moment from 'moment-timezone';

const Profile = () => {
  const loginUser = useRecoilValue(loginUserState);
  const loginUserBooks = useRecoilValue(loginUserBooksState);
  const loginUserFriends = useRecoilValue(loginUserFriendsState);
  const loginUserSubscribe = useRecoilValue(loginUserSubscribeState);

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
        <Box display="flex" alignItems="flex-end">
          <Avatar alt="profile-img" src={loginUser.profileImageUrl} />
          <Box m={1} />
          <Typography variant="subtitle1">
            {loginUser.displayName}さんのプロフィール
          </Typography>
          <Box m={1} />
        </Box>
        <Box m={3} />
        <Typography variant="subtitle2">
          追加した本の数: {loginUserBooks.length}冊
        </Typography>
        <Box m={2} />
        <Typography variant="subtitle2">
          フレンド: {loginUserFriends.length}人
        </Typography>
        <Box m={2} />
        <Typography variant="subtitle2">
          購読中のユーザー: {loginUserSubscribe.length}人
        </Typography>
        <Box m={2} />
        <Typography variant="subtitle2">
          登録日:{' '}
          {moment(loginUser.createdAt).tz('Asia/Tokyo').format('YYYY-MM-DD')}
        </Typography>
      </Box>
      <Box m={3} />
      <Box m={3} />
    </>
  );
};

export default Profile;
