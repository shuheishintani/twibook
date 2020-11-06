import { useState, useEffect, useCallback } from 'react';
import firebase, { db } from '@/firebase/client';
import { dbAdmin } from '@/firebase/admin';
import { useRecoilValue } from 'recoil';
import { loginUserState, loginUserBooksState } from '@/recoil/atoms';

import BookList from '@/components/BookList';
import { Button } from '@material-ui/core';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';

const Books = ({ bookListOwner, bookListOwnerBooks }) => {
  const [isMyList, setIsMyList] = useState(false);
  const [onEditMode, setOnEditMode] = useState(false);
  const [sharedBooks, setSharedBooks] = useState([]);
  const [subscribe, setSubscribe] = useState(false);
  const loginUser = useRecoilValue(loginUserState);
  const loginUserBooks = useRecoilValue(loginUserBooksState);

  useEffect(() => {
    if (loginUserBooks && bookListOwnerBooks) {
      const joinedArr = [...loginUserBooks, ...bookListOwnerBooks];
      const doubleArr = joinedArr.filter(
        item =>
          loginUserBooks.some(book => book.isbn === item.isbn) &&
          bookListOwnerBooks.some(book => book.isbn === item.isbn)
      );
      const singleArr = doubleArr.filter((item, index, arr) => {
        return arr.findIndex(item2 => item.isbn === item2.isbn) === index;
      });
      setSharedBooks(singleArr);
    }
  }, [bookListOwnerBooks, loginUserBooks]);

  useEffect(() => {
    if (loginUser) {
      setIsMyList(loginUser.uid === bookListOwner.uid);
    }
  }, [bookListOwner, loginUser]);

  const handleEditMode = useCallback(() => {
    setOnEditMode(prev => !prev);
  }, []);

  const handleSubscribe = useCallback(() => {
    const promise1 = new Promise((resolve, reject) => {
      db.doc(`users/${loginUser.uid}`)
        .collection('subscribe')
        .doc(bookListOwner.uid)
        .set({ uid: bookListOwner.uid })
        .then(() => resolve())
        .catch(e => reject(e));
    });

    const promise2 = new Promise((resolve, reject) => {
      db.doc(`users/${bookListOwner.uid}`)
        .collection('subscribedBy')
        .doc(loginUser.uid)
        .set({ uid: loginUser.uid })
        .then(() => resolve())
        .catch(e => reject(e));
    });

    Promise.all([promise1, promise2]).then(() => {
      setSubscribe(true);
    });
  }, [bookListOwner, loginUser]);

  const handleUnSubscribe = useCallback(() => {
    const promise1 = new Promise((resolve, reject) => {
      db.doc(`users/${loginUser.uid}`)
        .collection('subscribe')
        .doc(bookListOwner.uid)
        .delete()
        .then(() => resolve())
        .catch(e => reject(e));
    });

    const promise2 = new Promise((resolve, reject) => {
      db.doc(`users/${bookListOwner.uid}`)
        .collection('subscribedBy')
        .doc(loginUser.uid)
        .delete()
        .then(() => resolve())
        .catch(e => reject(e));
    });

    Promise.all([promise1, promise2]).then(() => {
      setSubscribe(false);
    });
  }, [bookListOwner, loginUser]);

  return (
    <>
      <p>{bookListOwner.displayName}さんの本棚</p>
      {isMyList && (
        <FormControlLabel
          control={
            <Switch
              checked={onEditMode}
              onChange={handleEditMode}
              name="onEditMode"
              color="primary"
            />
          }
          label="編集モード"
        />
      )}
      {!isMyList && subscribe && (
        <Button variant="contained" onClick={handleUnSubscribe}>
          ウォッチリストから削除
        </Button>
      )}

      {!isMyList && !subscribe && (
        <Button variant="contained" onClick={handleSubscribe}>
          ウォッチリストに追加
        </Button>
      )}

      {!isMyList &&
        sharedBooks.map(book => <p key={book.isbn}>{book.title}</p>)}

      {bookListOwnerBooks.length !== 0 && (
        <BookList
          books={bookListOwnerBooks}
          isMyList={isMyList}
          onEditMode={onEditMode}
        />
      )}
    </>
  );
};

export const getServerSideProps = async ctx => {
  const { username } = ctx.query;

  const bookListOwner = await dbAdmin
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

  const bookListOwnerBooks = await dbAdmin
    .collection('users')
    .doc(bookListOwner.uid)
    .collection('books')
    .get()
    .then(snapshot => {
      let data = [];
      snapshot.forEach(doc => data.push(doc.data()));
      return data;
    });

  return {
    props: {
      bookListOwner,
      bookListOwnerBooks,
    },
  };
};

export default Books;
