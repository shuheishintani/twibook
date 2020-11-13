/* eslint-disable prettier/prettier */
import { useState, useEffect } from 'react';
import { auth } from '@/firebase/client';
import { useRecoilState, useSetRecoilState } from 'recoil';
import {
  loginUserState,
  loginUserBooksState,
  loginUserFriendsState,
  loginUserSubscribeState,
  loginUserNotificationsState,
  snackbarOpenState
} from '@/recoil/atoms';
import { useRouter } from 'next/router';
import {
  Button,
  Box,
  Avatar,
  Typography,
  Modal,
  Backdrop,
  Fade,
  Snackbar
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));

const Profile = () => {
  const router = useRouter();
  const [loginUser, setLoginUser] = useRecoilState(loginUserState);
  const [loginUserBooks, setLoginUserBooks] = useRecoilState(
    loginUserBooksState
  );
  const setLoginUserFriends = useSetRecoilState(loginUserFriendsState);
  const setLoginUserSubscribe = useSetRecoilState(loginUserSubscribeState);
  const setLoginUserNotifications = useSetRecoilState(
    loginUserNotificationsState
  );
  const [snackbarOpen, setSnackbarOpen] = useRecoilState(snackbarOpenState);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const classes = useStyles();

  const deleteUser = async () => {
    if (loginUser && loginUser.uid === loginUser.uid) {
      setLoading(true);
      await fetch(`/api/firestore/users/${loginUser.uid}/deleteUser`);
      setLoginUser(null);
      setLoginUserBooks([]);
      setLoginUserFriends([]);
      setLoginUserSubscribe([]);
      setLoginUserNotifications([]);
      await auth.currentUser.delete();
      setSnackbarOpen(true)
      setLoading(false);
      router.push('/')
    }
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  if (!loginUser) {
    return <>
      <p>ユーザーが存在しません</p>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={1000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        message="アカウントを削除しました"
      />
    </>
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
      <Button variant="outlined" color="secondary" onClick={handleOpen}>
        アカウントを削除する
      </Button>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        className={classes.modal}
        open={open}
        onClose={handleClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={open}>
          {loading ? (
            <div className={classes.paper}>
              <p>Loading...</p>
            </div>
          ) : (
              <div className={classes.paper}>
                <h3 id="transition-modal-title">本当に削除しますか？</h3>
                <Box display="flex" justifyContent="center">
                  <Button variant="outlined" onClick={deleteUser}>
                    はい
                </Button>
                  <Box m={1} />
                  <Button variant="outlined" onClick={handleClose}>
                    いいえ
                </Button>
                </Box>
              </div>
            )}
        </Fade>
      </Modal>

    </>
  );
};

export default Profile;
