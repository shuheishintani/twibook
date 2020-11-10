import { useState, useEffect } from 'react';
import { db } from '@/firebase/client';
import { dbAdmin } from '@/firebase/admin';
import { useRecoilValue } from 'recoil';
import { loginUserState, loginUserNotificationsState } from '@/recoil/atoms';
import { useRouter } from 'next/router';
import Link from 'next/link';
import moment from 'moment-timezone';
import { Divider, Typography, Box } from '@material-ui/core';
import { Pagination, PaginationItem } from '@material-ui/lab';

const Notification = ({ notifications }) => {
  const loginUser = useRecoilValue(loginUserState);
  const router = useRouter();
  const { page } = router.query;
  const stringPage = parseInt(page);

  const handlePagination = (e, page) => {
    router.push(`/${loginUser.username}/notifications/${page}`);
  };

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

  const formattedNotifications = notifications.map(notification => ({
    ...notification,
    createdAt: moment(notification.createdAt)
      .tz('Asia/Tokyo')
      .format('YYYY-MM-DD HH:mm:ss'),
  }));

  if (!loginUser) {
    return <></>;
  }

  return (
    <>
      <Typography variant="subtitle1">新着通知</Typography>
      <Box m={3} />
      <Divider />
      {formattedNotifications &&
        formattedNotifications.map((notification, index) => {
          return (
            <div key={index}>
              <p>
                {notification.message}{' '}
                {new Date(notification.createdAt) > Date.now() - 86400000 && (
                  <span style={{ color: '#f50057' }}>new!</span>
                )}
              </p>
              <p>{notification.createdAt}</p>
              <Divider />
            </div>
          );
        })}
      <Box m={3} />
      <Pagination count={5} page={stringPage} onChange={handlePagination} />
    </>
  );
};

export const getServerSideProps = async ctx => {
  const { username, page } = ctx.query;

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

  const notifications = await dbAdmin
    .doc(`/users/${loginUser.uid}`)
    .collection('notifications')
    .orderBy('createdAt', 'desc')
    .limit(10)
    .offset((page - 1) * 10)
    .get()
    .then(snapshot => {
      let notifications = [];
      snapshot.forEach(doc => {
        notifications.push(doc.data());
      });
      return notifications;
    });

  const parsetNotifications = JSON.parse(JSON.stringify(notifications));

  return {
    props: {
      notifications: parsetNotifications,
    },
  };
};

export default Notification;
