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
  CircularProgress,
  ListItem,
  Divider,
  ListItemText,
  ListItemIcon,
  ListItemAvatar,
} from '@material-ui/core';

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
    cursor: 'pointer',
  },
  mobileRoot: {
    flexGrow: 1,
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
  },
  content: {
    width: '250px',
    flex: '1 0 auto',
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
      <Grid item>
        <Box boxShadow={7}>
          <Card className={classes.root} variant="outlined">
            <CardContent className={classes.content}>
              <Grid
                container
                spacing={0}
                direction="column"
                alignItems="center"
                justify="center"
                style={{ minHeight: '90px' }}
              >
                <CircularProgress />
              </Grid>
            </CardContent>
          </Card>
        </Box>
      </Grid>
    );
  }

  return (
    <>
      {window.innerWidth > 600 ? (
        <Grid item>
          <Box boxShadow={7}>
            <Link href={`/${friend.username}/books`}>
              <Card className={classes.root} variant="outlined">
                <div className={classes.details}>
                  <CardContent className={classes.content}>
                    <Box display="flex" alignItems="flex-start">
                      <Box display="flex" flexGrow={1}>
                        <Avatar
                          alt="profile-img"
                          src={friend.profileImageUrl}
                        />
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
                      {friend.createdAt > Date.now() - 86400000 && (
                        <Typography variant="subtitle2" color="secondary">
                          new!
                        </Typography>
                      )}
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
      ) : (
          <>
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
            <Divider />
          </>
        )}
    </>
  );
};

export default FriendListItem;
