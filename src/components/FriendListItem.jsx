/* eslint-disable prettier/prettier */
import { useState, useEffect } from 'react';
import { db } from '@/firebase/client';
import { useRecoilValue } from 'recoil';
import { loginUserBooksState } from '@/recoil/atoms';
import Link from 'next/link';
import { makeStyles } from '@material-ui/core/styles';
import {
  Typography,
  Avatar,
  Box,
  CircularProgress,
  ListItem,
  Divider,
  ListItemText,
  ListItemIcon,
} from '@material-ui/core';

const useStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
  },
  inline: {
    display: 'inline',
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
    return (
      <CircularProgress />
    );
  }

  return (
    <>
      <Link href={`/${friend.username}/books`}>
        <ListItem button className={classes.mobileRoot}>
          <ListItemIcon>
            <Avatar alt="profile-img" src={friend.profileImageUrl} />
          </ListItemIcon>
          <ListItemText
            primary={
              <>
                <Box display="flex">
                  <Typography variant="body2">
                    {friend.displayName}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    @{friend.username}
                  </Typography>
                  <Box m={1} />
                  {friend.createdAt > Date.now() - 86400000 && (
                    <Typography variant="body2" color="secondary">
                      new!
                    </Typography>
                  )}
                </Box>
                <Box m={1} />
                {sharedBooks.length !== 0 && (
                  <Typography variant="body2" color="primary">
                    共通の本が{sharedBooks.length}冊あります
                  </Typography>
                )}
              </>
            }
          />
        </ListItem>
      </Link>

      <Divider />
    </>
  );
};

export default FriendListItem;
