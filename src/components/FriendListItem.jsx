import { useState, useEffect } from 'react';
import { db } from '@/firebase/client';
import { useRecoilValue } from 'recoil';
import { loginUserBooksState } from '@/recoil/atoms';
import Link from 'next/link';
import { makeStyles } from '@material-ui/core/styles';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Box,
} from '@material-ui/core';

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
    cursor: 'pointer',
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
  },
  content: {
    width: '250px',
    flex: '1 0 auto',
  },
}));

const FriendListItem = ({ friendId }) => {
  const classes = useStyles();
  const loginUserBooks = useRecoilValue(loginUserBooksState);
  const [friend, setFriend] = useState(null);
  const [friendBooks, setFriendBooks] = useState([]);
  const [sharedBooks, setSharedBooks] = useState([]);

  useEffect(() => {
    db.collection('users')
      .doc(friendId)
      .get()
      .then(doc => setFriend(doc.data()));

    db.collection('users')
      .doc(friendId)
      .collection('books')
      .get()
      .then(snapshot => {
        let books = [];
        snapshot.forEach(doc => books.push(doc.data()));
        setFriendBooks(books);
      });
  }, [friendId]);

  useEffect(() => {
    if (loginUserBooks && friendBooks) {
      const joinedArr = [...loginUserBooks, ...friendBooks];
      const doubleArr = joinedArr.filter(
        item =>
          loginUserBooks.some(book => book.isbn === item.isbn) &&
          friendBooks.some(book => book.isbn === item.isbn)
      );
      const singleArr = doubleArr.filter((item, index, arr) => {
        return arr.findIndex(item2 => item.isbn === item2.isbn) === index;
      });
      setSharedBooks(singleArr);
    }
  }, [friendBooks, loginUserBooks]);

  if (!friend) {
    return <p>Loading...</p>;
  }

  return (
    <Grid item>
      <Box boxShadow={7}>
        <Link href={`/${friend.username}/books`}>
          <Card className={classes.root} variant="outlined">
            <div className={classes.details}>
              <CardContent className={classes.content}>
                <Box display="flex">
                  <Avatar alt="profile-img" src={friend.profileImageUrl} />
                  <Box m={1} />
                  <Box>
                    <Typography variant="subtitle1">
                      {friend.displayName}
                    </Typography>
                    <Typography variant="subtitle2" color="textSecondary">
                      @{friend.username}
                    </Typography>
                  </Box>
                </Box>
                <Box m={2} />
                {sharedBooks.length !== 0 && (
                  <Typography variant="subtitle2" color="primary">
                    共通の本が{sharedBooks.length}冊あります
                  </Typography>
                )}
              </CardContent>
            </div>
          </Card>
        </Link>
      </Box>
    </Grid>
  );
};

export default FriendListItem;
