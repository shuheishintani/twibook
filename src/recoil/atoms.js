import { atom } from 'recoil';

export const loginUserState = atom({
  key: 'loginUser',
  default: null,
});

export const loginUserFriendsState = atom({
  key: 'loginUserFriends',
  default: [],
});

export const loginUserBooksState = atom({
  key: 'loginUserBooks',
  default: [],
});

export const loginUserNotificationsState = atom({
  key: 'loginUserNotifications',
  default: [],
});
