import firebase, { db, auth } from '@/firebase/client';
import { useSetRecoilState } from 'recoil';
import {
  loginUserState,
  loginUserFriendsState,
  loginUserBooksState,
} from '@/recoil/atoms';
import { useRouter } from 'next/router';

export default function useLoginMethod() {
  const setLoginUser = useSetRecoilState(loginUserState);
  const setLoginUserFriends = useSetRecoilState(loginUserFriendsState);
  const setLoginUserBooks = useSetRecoilState(loginUserBooksState);

  const router = useRouter();

  const login = () => {
    const provider = new firebase.auth.TwitterAuthProvider();
    provider.setCustomParameters({ lang: 'ja' });
    auth
      .signInWithPopup(provider)
      .then(async result => {
        const {
          id_str,
          screen_name,
          name,
          profile_image_url,
        } = result.additionalUserInfo.profile;

        const { accessToken, secret } = result.credential;

        const loginUser = {
          uid: id_str,
          username: screen_name,
          displayName: name,
          profileImageUrl: profile_image_url,
          createdAt: Date.now(),
        };

        const response = await fetch(
          `/api/firestore/users/${loginUser.id_str}/updateProfile`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              accessToken,
              secret,
              loginUser,
            }),
          }
        );

        const { newEntry } = await response.json();

        return new Promise(resolve => {
          resolve(newEntry);
        });
      })
      .then(newEntry => {
        router.push('/');
        newEntry && router.reload();
      })
      .catch(e => {
        console.error(e);
      });
  };

  const logout = () => {
    auth
      .signOut()
      .then(() => {
        setLoginUser(null);
        setLoginUserFriends([]);
        setLoginUserBooks([]);
        router.push('/');
      })
      .catch(e => {
        console.error(e);
      });
  };
  return [login, logout];
}
