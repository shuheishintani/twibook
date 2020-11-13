/* eslint-disable prettier/prettier */
import { useState, useEffect } from 'react';
import { dbAdmin } from '@/firebase/admin';
import { useRecoilValue } from 'recoil';
import { loginUserNotificationsState, loginUserState } from '@/recoil/atoms';
import useSWR from 'swr';
import { useRouter } from 'next/router';
import moment from 'moment-timezone';
import { Divider, Typography, Box, Avatar } from '@material-ui/core';
import { Pagination } from '@material-ui/lab';

const Notification = () => {
  const router = useRouter();
  const { page } = router.query;
  const stringPage = parseInt(page);
  const loginUserNotifications = useRecoilValue(loginUserNotificationsState);
  const loginUser = useRecoilValue(loginUserState);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (loginUserNotifications) {
      const formattedNotifications = loginUserNotifications.map(
        notification => ({
          ...notification,
          createdAt: moment(notification.createdAt)
            .tz('Asia/Tokyo')
            .format('YYYY-MM-DD HH:mm:ss'),
        })
      );
      setNotifications(formattedNotifications.slice(page * 10, page * 10 + 10));
    }
  }, [loginUserNotifications, page]);

  useEffect(() => {
    if (loginUser) {
      fetch(`/api/firestore/users/${loginUser.uid}/readNotification`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
  }, [loginUser]);

  const handlePagination = (e, page) => {
    router.push(`/${loginUser.username}/notifications/${page}`);
  };

  if (!loginUser) {
    return <></>;
  }

  return (
    <>
      <Typography variant="subtitle1">新着通知</Typography>
      <Box m={3} />
      {notifications &&
        notifications.map((notification, index) => {
          return (
            <div key={index}>
              <Box display="flex" alignItems="center">
                <Avatar src={notification.createdBy.profileImageUrl} />
                <Box m={1} />
                <Box>
                  <p>
                    {notification.message}{' '}
                    {new Date(notification.createdAt) >
                      Date.now() - 86400000 && (
                        <span style={{ color: '#f50057' }}>new!</span>
                      )}
                  </p>
                  <Typography variant="body2" color="textSecondary">
                    {notification.createdAt}
                  </Typography>
                </Box>
              </Box>

              <Box m={1} />
              <Divider />
            </div>
          );
        })}
      <Box m={3} />
      {loginUserNotifications && (
        <Pagination
          count={Math.floor(loginUserNotifications.length / 10)}
          page={stringPage}
          onChange={handlePagination}
        />
      )}
    </>
  );
};

export const getServerSideProps = async ctx => {
  const { username } = ctx.query;

  const loginUser = await dbAdmin
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

  return {
    props: {
      loginUser,
    },
  };
};

export default Notification;
