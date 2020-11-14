import { useState, useEffect, useCallback } from 'react';
import { db } from '@/firebase/client';
import { dbAdmin } from '@/firebase/admin';
import { useRecoilValue, useRecoilState } from 'recoil';
import {
  loginUserState,
  loginUserBooksState,
  loginUserSubscribeState,
} from '@/recoil/atoms';
import useSWR from 'swr';
import { useRouter } from 'next/router';
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
  Button,
} from '@material-ui/core';
import {
  ExpandMore as ExpandMoreIcon,
  Twitter as TwitterIcon,
  People as PeopleIcon,
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() => ({
  shareBtn: {
    textTransform: 'none',
  },
}));

const fetchBooksByUid = async uid => {
  const snapshot = await db
    .collection('users')
    .doc(uid)
    .collection('books')
    .get();

  return new Promise((resolve, reject) => {
    const books = snapshot.docs.map(doc => doc.data());
    resolve({ books });
  });
};

const Books = ({ bookListOwner }) => {
  const [isMyList, setIsMyList] = useState(false);
  const [onEditMode, setOnEditMode] = useState(false);
  const [sharedBooks, setSharedBooks] = useState([]);
  const [subscribe, setSubscribe] = useState(false);
  const [books, setBooks] = useState([]);
  const loginUser = useRecoilValue(loginUserState);
  const loginUserBooks = useRecoilValue(loginUserBooksState);
  const [loginUserSubscribe, setLoginUserSubscribe] = useRecoilState(
    loginUserSubscribeState
  );
  const router = useRouter();
  const { username } = router.query;
  const { data, error } = useSWR(`/${username}/books`, () =>
    fetchBooksByUid(bookListOwner.uid)
  );
  const classes = useStyles();

  useEffect(() => {
    data && setBooks(data.books);
  }, [data]);

  useEffect(() => {
    if (loginUser && bookListOwner && loginUserSubscribe.length !== 0) {
      const loginUserSubscribeIds = loginUserSubscribe.map(user => user.uid);
      setSubscribe(loginUserSubscribeIds.includes(bookListOwner.uid));
    }
  }, [bookListOwner, loginUser, loginUserSubscribe]);

  useEffect(() => {
    if (loginUserBooks && books) {
      const joinedArr = [...loginUserBooks, ...books];
      const doubleArr = joinedArr.filter(
        item =>
          loginUserBooks.some(book => book.isbn === item.isbn) &&
          books.some(book => book.isbn === item.isbn)
      );
      const singleArr = doubleArr.filter((item, index, arr) => {
        return arr.findIndex(item2 => item.isbn === item2.isbn) === index;
      });
      setSharedBooks(singleArr);
    }
  }, [books, loginUserBooks]);

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

  if (!data) {
    return <p>Loading...</p>;
  }

  if (error) {
    throw new Error(error);
  }

  return (
    <>
      <Box display="flex" alignItems="flex-end" flexWrap="wrap">
        <Box>
          <Box display="flex" alignItems="flex-end">
            <Avatar alt="profile-img" src={bookListOwner.profileImageUrl} />
            <Box m={1} />
            <Typography variant="subtitle1">
              {bookListOwner.displayName}さんの本棚
            </Typography>
            <Box m={2} />
            <Link href={`/${bookListOwner.username}/friends`}>
              <IconButton size="small">
                <PeopleIcon />
              </IconButton>
            </Link>

            <Box m={1} />
            <IconButton
              size="small"
              onClick={() => {
                window.open(`https://twitter.com/${bookListOwner.username}`);
              }}
            >
              <TwitterIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>

      <Box m={3} />

      <Box m={3} />

      {isMyList && (
        <>
          <Button
            variant="outlined"
            onClick={() => {
              window.open(
                `http://twitter.com/share?url=twibook.vercel.app/${bookListOwner.username}/books&text=${bookListOwner.displayName}さんの本棚`
              );
            }}
            className={classes.shareBtn}
          >
            <TwitterIcon fontSize="small" style={{ color: '#1DA1F2' }} />
            <Box m={1} />
            本棚を公開する
          </Button>
          <Box m={3} />
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
          <Box m={3} />
        </>
      )}

      {loginUser && !isMyList && (
        <>
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
          <Box m={3} />
        </>
      )}

      {!isMyList && (
        <>
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
          <Box m={3} />
        </>
      )}

      {books && books.length !== 0 && (
        <BookList books={books} isMyList={isMyList} onEditMode={onEditMode} />
      )}
    </>
  );
};

export const getStaticPaths = async () => {
  const usernameList = await dbAdmin
    .collection('users')
    .get()
    .then(snapshot => snapshot.docs.map(doc => doc.data().username));

  return {
    paths: usernameList.map(username => ({
      params: {
        username,
      },
    })),
    fallback: true,
  };
};

export const getStaticProps = async ({ params: { username } }) => {
  const snapshot = await dbAdmin
    .collection('users')
    .where('username', '==', username)
    .get();

  const bookListOwner =
    snapshot.docs.length !== 0 ? snapshot.docs[0].data() : null;

  return {
    props: {
      bookListOwner,
    },
    revalidate: 1,
  };
};

export default Books;
