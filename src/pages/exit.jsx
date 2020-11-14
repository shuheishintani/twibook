/* eslint-disable prettier/prettier */
import { useState } from 'react';
import { auth } from '@/firebase/client';
import { useRecoilState, useSetRecoilState } from 'recoil';
import {
  loginUserState,
  loginUserBooksState,
  loginUserFriendsState,
  loginUserSubscribeState,
  loginUserNotificationsState,
} from '@/recoil/atoms';
import Link from 'next/link';
import { Snackbar, Button, Modal, Fade, Backdrop, Box, CircularProgress } from '@material-ui/core';
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

const Exit = () => {
  const [loginUser, setLoginUser] = useRecoilState(loginUserState);
  const [loginUserBooks, setLoginUserBooks] = useRecoilState(
    loginUserBooksState
  );
  const setLoginUserFriends = useSetRecoilState(loginUserFriendsState);
  const setLoginUserSubscribe = useSetRecoilState(loginUserSubscribeState);
  const setLoginUserNotifications = useSetRecoilState(
    loginUserNotificationsState
  );
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const classes = useStyles();

  const handleModalOpen = () => {
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

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
      setLoading(false);
      setSnackbarOpen(true);
    }
  };

  if (!loginUser) {
    return <>
      <p>ユーザーが存在しません</p>
      <Box m={3} />
      <Link href="/">
        <Button variant="outlined" >
          ホーム画面に戻る
        </Button>
      </Link>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        message="アカウントを削除しました"
      />
    </>
  }

  return (
    <>
      <p>ユーザーに関連する一切のデータが消去されます</p>
      {loginUser && (
        <Button variant="outlined" color="secondary" onClick={handleModalOpen}>
          退会する
        </Button>
      )}
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        className={classes.modal}
        open={modalOpen}
        onClose={handleModalClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={modalOpen}>
          {loading ? (
            <div className={classes.paper}>
              <CircularProgress />
            </div>
          ) : (
              <div className={classes.paper}>
                <h3 id="transition-modal-title">本当に退会しますか？</h3>
                <Box display="flex" justifyContent="center">
                  <Button variant="outlined" onClick={deleteUser}>
                    はい
                </Button>
                  <Box m={1} />
                  <Button variant="outlined" onClick={handleModalClose}>
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

export default Exit;
