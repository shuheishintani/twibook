import { useState, useEffect } from 'react';
import { dbAdmin } from '@/firebase/admin';
import { useRecoilValue } from 'recoil';
import { loginUserState, loginUserFriendsState } from '@/recoil/atoms';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { fetchBookByIsbn } from '@/lib/rakutenBookApi';
import useSWR from 'swr';
import { Avatar, Typography, Box, Divider, Button } from '@material-ui/core';
import AvatarGroup from '@material-ui/lab/AvatarGroup';
import { motion } from 'framer-motion';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() => ({
  root: {
    cursor: 'pointer',
  },
  amazonBtn: {
    textTransform: 'none',
  },
}));

const toISBN10 = isbn13 => {
  const src = isbn13.slice(3, 12);

  const sum = src
    .split('')
    .map(s => parseInt(s))
    .reduce((p, c, i) => (i === 1 ? p * 10 : p) + c * (10 - i));

  const rem = 11 - (sum % 11);
  const checkdigit = rem === 11 ? 0 : rem === 10 ? 'X' : rem;

  return `${src}${checkdigit}`;
};

const BookDetail = ({ readers }) => {
  const classes = useStyles();
  const router = useRouter();
  const { isbn } = router.query;
  const [book, setBook] = useState(null);
  const [friendReaders, setFriendReaders] = useState([]);
  const [unknownReaders, setUnknownReaders] = useState([]);
  const loginUserFriends = useRecoilValue(loginUserFriendsState);
  const loginUser = useRecoilValue(loginUserState);
  const { data, error } = useSWR(`/books/${isbn}`, () => fetchBookByIsbn(isbn));

  useEffect(() => {
    data && setBook(data.book);
  }, [data]);

  useEffect(() => {
    if (loginUserFriends) {
      const loginUserFriendIds = loginUserFriends.map(friend => friend.uid);
      setFriendReaders(
        readers.filter(
          reader =>
            loginUserFriendIds.includes(reader.uid) &&
            reader.uid !== loginUser.uid
        )
      );
      setUnknownReaders(
        readers.filter(
          reader =>
            !loginUserFriendIds.includes(reader.uid) &&
            reader.uid !== loginUser.uid
        )
      );
    }
  }, [loginUser, loginUserFriends, readers]);

  console.log({ friendReaders });
  console.log({ unknownReaders });

  if (!data) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>データが存在しません</p>;
  }

  return (
    <>
      {book && (
        <>
          <Box display="flex">
            <img
              src={book.coverImageUrl}
              alt="cover_img"
              width="105"
              height="148"
            />
            <Box m={1} />
            <Box>
              <Box m={1} />
              <Typography variant="subtitle1">{book.title}</Typography>
              <Box m={2} />
              <Typography variant="subtitle2">
                {book.author} （{book.publisherName}）
              </Typography>
              <Box m={2} />
              <Typography variant="subtitle2"></Typography>
              <p>¥{book.price}</p>
              <p>{book.salesDate}</p>
            </Box>
          </Box>

          <Box m={3} />
          <Typography variant="subtitle2">{book.description}</Typography>
          <Box m={3} />

          <Button
            variant="outlined"
            onClick={() => {
              window.open(
                `http://www.amazon.co.jp/dp/${toISBN10(
                  book.isbn
                )}/ref=noism?tag=twibook-22`
              );
            }}
            className={classes.amazonBtn}
          >
            <img src="/amazon.png" alt="amazon_logo" width="20" height="20" />
            <Box m={1} />
            Amazonで購入する
          </Button>
          <Box m={3} />

          <Divider />
          <Box m={3} />

          {friendReaders.length !== 0 && (
            <>
              <Typography variant="subtitle2">この本を読んだ友達</Typography>
              <Box m={1} />
              <AvatarGroup>
                {friendReaders.map(reader => (
                  <motion.div
                    key={reader.uid}
                    whileHover={{ scale: 1.1 }}
                    className={classes.root}
                  >
                    <Link href={`/${reader.username}/books`}>
                      <Avatar alt="profile-img" src={reader.profileImageUrl} />
                    </Link>
                  </motion.div>
                ))}
              </AvatarGroup>
            </>
          )}
          <Box m={3} />
          {unknownReaders.length !== 0 && (
            <>
              <Typography variant="subtitle2">
                この本を読んだユーザー
              </Typography>
              <Box m={1} />
              <AvatarGroup max={30}>
                {unknownReaders.map(reader => (
                  <motion.div
                    key={reader.uid}
                    whileHover={{ scale: 1.1 }}
                    className={classes.root}
                  >
                    <Link href={`/${reader.username}/books`}>
                      <Avatar alt="profile-img" src={reader.profileImageUrl} />
                    </Link>
                  </motion.div>
                ))}
              </AvatarGroup>
            </>
          )}
        </>
      )}
    </>
  );
};

export default BookDetail;

export const getStaticPaths = async () => {
  const isbnList = await dbAdmin
    .collectionGroup('books')
    .get()
    .then(snapshot => snapshot.docs.map(doc => doc.data().isbn));
  const dedupedIsbnList = [...new Set(isbnList)];

  return {
    paths: dedupedIsbnList.map(isbn => ({
      params: {
        isbn,
      },
    })),
    fallback: true,
  };
};

export const getStaticProps = async ({ params: { isbn } }) => {
  const readerIds = await dbAdmin
    .collectionGroup('books')
    .where('isbn', '==', isbn)
    .get()
    .then(snapshot => snapshot.docs.map(doc => doc.data().ownerId));

  if (readerIds.length === 0) {
    return {
      props: {
        readers: [],
      },
      revalidate: 1,
    };
  }

  const readerRefs = readerIds.map(id => dbAdmin.doc(`users/${id}`));
  const readers = await dbAdmin
    .getAll(...readerRefs)
    .then(snapshot => snapshot.map(doc => doc.data()));

  return {
    props: {
      readers,
    },
    revalidate: 1,
  };
};
