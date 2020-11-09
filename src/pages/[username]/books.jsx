import { useState, useEffect, useCallback } from 'react';
import { db } from '@/firebase/client';
import { dbAdmin } from '@/firebase/admin';
import { useRecoilValue, useRecoilState } from 'recoil';
import {
  loginUserState,
  loginUserBooksState,
  loginUserSubscribeState,
} from '@/recoil/atoms';
import Link from 'next/link';
import BookList from '@/components/BookList';
import {
  FormControlLabel,
  Switch,
  Typography,
  Avatar,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
} from '@material-ui/core';
import {
  ExpandMore as ExpandMoreIcon,
  Twitter as TwitterIcon,
} from '@material-ui/icons';

const Books = ({ bookListOwner, bookListOwnerBooks }) => {
  const [isMyList, setIsMyList] = useState(false);
  const [onEditMode, setOnEditMode] = useState(false);
  const [sharedBooks, setSharedBooks] = useState([]);
  const [subscribe, setSubscribe] = useState(false);
  const loginUser = useRecoilValue(loginUserState);
  const loginUserBooks = useRecoilValue(loginUserBooksState);
  const [loginUserSubscribe, setLoginUserSubscribe] = useRecoilState(
    loginUserSubscribeState
  );

  useEffect(() => {
    if (loginUser && bookListOwner && loginUserSubscribe.length !== 0) {
      const loginUserSubscribeIds = loginUserSubscribe.map(user => user.uid);
      setSubscribe(loginUserSubscribeIds.includes(bookListOwner.uid));
    }
  }, [bookListOwner, loginUser, loginUserSubscribe]);

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
    if (loginUser && bookListOwner) {
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
      setLoginUserSubscribe(prev => [...prev, { uid: bookListOwner.uid }]);

      setSubscribe(true);
    });
  }, [bookListOwner, loginUser, setLoginUserSubscribe]);

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
      setLoginUserSubscribe(prev =>
        prev.filter(user => user.uid !== bookListOwner.uid)
      );
      setSubscribe(false);
    });
  }, [bookListOwner, loginUser, setLoginUserSubscribe]);

  if (!bookListOwner) {
    return <p>ユーザーが存在しません</p>;
  }

  return (
    <>
      <Box display="flex" alignItems="flex-end">
        <Box flexGrow={1}>
          <Box display="flex" alignItems="flex-end">
            <Avatar alt="profile-img" src={bookListOwner.profileImageUrl} />
            <Box m={1} />
            <Typography variant="subtitle1">
              {bookListOwner.displayName}さんの本棚
            </Typography>
            <Box m={1} />
            <IconButton
              size="small"
              style={{ color: '#1DA1F2' }}
              onClick={() => {
                window.open(`https://twitter.com/${bookListOwner.username}`);
              }}
            >
              <TwitterIcon />
            </IconButton>
          </Box>
        </Box>

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
            label={<Typography variant="subtitle2">編集モード</Typography>}
          />
        )}

        {loginUser && !isMyList && (
          <FormControlLabel
            control={
              <Switch
                checked={subscribe}
                onChange={subscribe ? handleUnSubscribe : handleSubscribe}
                name="onEditMode"
                color="primary"
              />
            }
            label={
              <Typography variant="subtitle2">更新通知を受け取る</Typography>
            }
          />
        )}
      </Box>

      <Box m={3} />

      {!isMyList && (
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography variant="subtitle2">
              共通の本（{sharedBooks.length}）
            </Typography>
          </AccordionSummary>

          {sharedBooks.map((book, index) => (
            <AccordionDetails key={index}>
              <Typography variant="subtitle2">
                {book.author}『{book.title}』（{book.publisherName}）
              </Typography>
            </AccordionDetails>
          ))}
        </Accordion>
      )}

      <Box m={3} />

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

  if (!bookListOwner) {
    return {
      props: {
        bookListOwner: null,
      },
    };
  }

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
