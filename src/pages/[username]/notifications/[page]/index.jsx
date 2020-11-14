/* eslint-disable prettier/prettier */
import { useState, useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { loginUserNotificationsState, loginUserState } from '@/recoil/atoms';
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
      setNotifications(formattedNotifications.slice((page - 1) * 20, (page - 1) * 20 + 20));
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
    router.push(`/${loginUser.username}/notifications/${page}`).then(() => {
      window.scroll({
        top: 0,
        left: 0,
      });
    })
  };

  if (!loginUser) {
    return <></>;
  }

  console.log(loginUserNotifications)

  if (notifications.length === 0) {
    return <Typography variant="subtitle1">新着通知はありません</Typography>
  }

  return (
    <>
      <Typography variant="subtitle1">新着通知</Typography>
      <Box m={3} />
      {loginUserNotifications.length > (page - 1) * 20 + 20 ? (
        <Typography variant="subtitle2">{(page - 1) * 20 + 1}件目〜{(page - 1) * 20 + 20}件目を表示</Typography>
      ) : (
          <Typography variant="subtitle2">{(page - 1) * 20 + 1}件目〜{loginUserNotifications.length}件目を表示</Typography>
        )}
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
      {loginUserNotifications.length !== 0 && (
        <Pagination
          count={Math.floor(loginUserNotifications.length / 20) + 1}
          page={stringPage}
          onChange={handlePagination}
        />
      )}
    </>
  );
};

export default Notification;
