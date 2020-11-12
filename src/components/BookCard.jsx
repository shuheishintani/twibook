// /* eslint-disable prettier/prettier */
import React, { useState, useEffect, useCallback } from 'react';
import { db } from '@/firebase/client';
import { useRecoilState, useRecoilValue } from 'recoil';
import { loginUserState, loginUserBooksState } from '@/recoil/atoms';
import Link from 'next/link';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Box,
} from '@material-ui/core';
import { Add } from '@material-ui/icons';
import Snackbar from '@material-ui/core/Snackbar';

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    alignItems: 'flex-start',
    height: '148px',
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
  },
  content: {
    flex: '1 0 auto',
    width: '230px',
    [theme.breakpoints.down('sm')]: {
      width: '80vh',
    },
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
  },
  playIcon: {
    height: 38,
    width: 38,
  },
  addBtn: {
    height: '45px',
  },
  hoverUnderline: {
    '&:hover': {
      textDecoration: 'underline',
      cursor: 'pointer',
    },
  },
}));

const BookCard = ({ book }) => {
  const classes = useStyles();
  const loginUser = useRecoilValue(loginUserState);
  const [loginUserBooks, setLoginUserBooks] = useRecoilState(
    loginUserBooksState
  );
  const [added, setAdded] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const { isbn, title, author, publisherName, coverImageUrl } = book;

  useEffect(() => {
    if (loginUserBooks.length !== 0) {
      const isbnList = loginUserBooks.map(book => book.isbn);
      setAdded(isbnList.includes(isbn));
    }
  }, [isbn, loginUser, loginUserBooks]);

  const addBook = useCallback(async () => {
    const loginUserBooksRef = db
      .collection('users')
      .doc(loginUser.uid)
      .collection('books')
      .doc();

    const promise1 = new Promise((resolve, reject) => {
      loginUserBooksRef
        .set({
          id: loginUserBooksRef.id,
          ownerId: loginUser.uid,
          ...book,
        })
        .then(() => resolve())
        .catch(e => reject(e));
    });

    const promise2 = new Promise((resolve, reject) => {
      fetch(`/api/firestore/users/${loginUser.uid}/addBook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ book }),
      })
        .then(() => resolve())
        .catch(e => reject(e));
    });

    Promise.all([promise1, promise2]).then(() => {
      setLoginUserBooks(prev => [
        ...prev,
        {
          id: loginUserBooksRef.id,
          ...book,
        },
      ]);
      setAdded(true);
      setSnackbarOpen(true);
    });
  }, [book, loginUser, setLoginUserBooks]);

  return (
    <>
      <Grid item>
        <Box boxShadow={7}>
          <Card className={classes.root}>
            <img src={coverImageUrl} alt="cover_img" width="105" height="148" />
            <div className={classes.details}>
              <CardContent className={classes.content}>
                <Link href={`/books/${book.isbn}`}>
                  <div className={classes.hoverUnderline}>
                    <Typography variant="subtitle1">{title}</Typography>
                    <Typography variant="subtitle2" color="textSecondary">
                      {author}（{publisherName}）
                    </Typography>
                  </div>
                </Link>
              </CardContent>
            </div>
            {loginUser && (
              <IconButton
                className={classes.addBtn}
                variant="contained"
                disabled={added}
                onClick={addBook}
                color="primary"
              >
                <Add />
              </IconButton>
            )}
          </Card>
        </Box>
      </Grid>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={1000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        message="本棚に追加しました！"
      />
    </>
  );
};

export default BookCard;
