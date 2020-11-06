import { useEffect } from 'react';
import { db } from '@/firebase/client';
import { useRecoilValue } from 'recoil';
import { loginUserState, loginUserNotificationsState } from '@/recoil/atoms';
import moment from 'moment-timezone';

const Notification = () => {
  const loginUser = useRecoilValue(loginUserState);
  const loginUserNotifications = useRecoilValue(loginUserNotificationsState);

  useEffect(() => {
    fetch(`/api/firestore/users/${loginUser.uid}/readNotification`);
  });

  const addBookNotifications =
    loginUserNotifications &&
    loginUserNotifications.filter(
      notification => notification.type === 'addBook'
    );

  const formattedAddBookNotifications = addBookNotifications.map(
    notification => ({
      ...notification,
      createdAt: moment(notification.createdAt)
        .tz('Asia/Tokyo')
        .format('YYYY-MM-DD HH:mm:ss'),
    })
  );

  return (
    <>
      {formattedAddBookNotifications &&
        formattedAddBookNotifications.map((notification, index) => (
          <div key={index}>
            <p>{notification.message}</p>
            <p>{notification.createdAt}</p>
          </div>
        ))}
    </>
  );
};

export default Notification;
