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

export const loginUserSubscribeState = atom({
  key: 'loginUserSubscribe',
  default: [],
});

export const loginUserNotificationsState = atom({
  key: 'loginUserNotifications',
  default: [],
});

export const searchedBooksState = atom({
  key: 'searchedBooks',
  default: [],
});

export const titleKeywordState = atom({
  key: 'titleKeyword',
  default: null,
});

export const authorKeywordState = atom({
  key: 'authorKeyword',
  default: null,
});

export const snackbarOpenState = atom({
  key: 'snackbarOpen',
  defualt: false,
});
