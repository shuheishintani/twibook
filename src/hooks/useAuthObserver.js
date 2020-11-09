import { useEffect } from 'react';
import { auth, db } from '@/firebase/client';
import { useRecoilState } from 'recoil';
import {
  loginUserState,
  loginUserFriendsState,
  loginUserSubscribeState,
  loginUserBooksState,
} from '@/recoil/atoms';

export default function useAuthObserver() {
  const [loginUser, setLoginUser] = useRecoilState(loginUserState);
  const [loginUserFriends, setLoginUserFriends] = useRecoilState(
    loginUserFriendsState
  );
  const [loginUserSubscribe, setLoginUserSubscribe] = useRecoilState(
    loginUserSubscribeState
  );
  const [loginUserBooks, setLoginUserBooks] = useRecoilState(
    loginUserBooksState
  );

  useEffect(() => {
    if (loginUser) {
      return;
    }

    const unlisten = auth.onAuthStateChanged(user => {
      if (!user) {
        setLoginUser(null);
      } else {
        const loginUserRef = db
          .collection('users')
          .doc(user.providerData[0].uid);

        loginUserRef.get().then(doc => setLoginUser(doc.data()));

        loginUserRef
          .collection('friends')
          .get()
          .then(snapshot => {
            let friends = [];
            snapshot.forEach(doc => {
              friends.push(doc.data());
            });
            setLoginUserFriends(friends);
          });

        loginUserRef
          .collection('subscribe')
          .get()
          .then(snapshot => {
            let subscribe = [];
            snapshot.forEach(doc => {
              subscribe.push(doc.data());
            });
            setLoginUserSubscribe(subscribe);
          });

        loginUserRef
          .collection('books')
          .get()
          .then(snapshot => {
            let books = [];
            snapshot.forEach(doc => {
              books.push(doc.data());
            });
            setLoginUserBooks(books);
          });
      }
    });
    return () => {
      unlisten();
    };
  }, [
    loginUser,
    setLoginUser,
    setLoginUserBooks,
    setLoginUserFriends,
    setLoginUserSubscribe,
  ]);

  return [loginUser, loginUserFriends, loginUserBooks];
}
