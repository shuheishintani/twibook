import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { loginUserState, loginUserNotificationsState } from '@/recoil/atoms';
import { useRouter } from 'next/router';
import moment from 'moment-timezone';

const Notification = () => {
  const loginUser = useRecoilValue(loginUserState);
  const loginUserNotifications = useRecoilValue(loginUserNotificationsState);
  const router = useRouter();

  useEffect(() => {
    if (loginUser) {
      fetch(`/api/firestore/users/${loginUser.uid}/readNotification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'addBook' }),
      });
    } else {
      router.push('/');
    }
  }, [loginUser, router]);

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
