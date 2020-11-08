/* eslint-disable prettier/prettier */
import React, { useState, useEffect } from 'react';
import firebase, { db } from '@/firebase/client';
import { useRecoilValue, useRecoilState } from 'recoil';
import { loginUserState, loginUserBooksState } from '@/recoil/atoms';
import Image from 'next/image';
import Link from 'next/link';
import { Grid, Box, IconButton, Card } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import ClearIcon from '@material-ui/icons/Clear';
import { motion } from 'framer-motion';

const useStyles = makeStyles(() => ({
  root: {
    cursor: 'pointer',
  },
}));

const BookListItem = ({
  book,
  isMyList,
  onEditMode,
  loginUserBooksIsbnList,
}) => {
  const [exists, setExists] = useState(true);
  const [isShared, setIsShared] = useState(false);
  const loginUser = useRecoilValue(loginUserState);
  const [loginUserBooks, setLoginUserBooks] = useRecoilState(
    loginUserBooksState
  );
  const classes = useStyles();

  useEffect(() => {
    if (loginUserBooksIsbnList) {
      setIsShared(loginUserBooksIsbnList.includes(book.isbn));
    }
  }, [book, loginUserBooksIsbnList]);

  const { isbn, coverImageUrl } = book;

  const handleDelete = () => {
    db.collection('users')
      .doc(loginUser.uid)
      .collection('books')
      .doc(book.id)
      .delete()
      .then(() => {
        const updatedBooks = loginUserBooks.filter(item => item.id !== book.id);
        setLoginUserBooks(updatedBooks);
        setExists(false);
      });
  };

  if (!exists) {
    return <></>;
  }

  return (
    <Grid item>
      <motion.div className="img-wrap" layout whileHover={{ scale: 1.1 }}>
        <Box display="flex" alignItems="flex-start">
          <Link href={`/books/${book.isbn}`}>
            {!isMyList && isShared ? (
              <Box boxShadow={7} border={3} borderColor="#00e676">
                <Card className={classes.root}>
                  <Image
                    src={coverImageUrl}
                    alt="cover image"
                    width={105}
                    height={148}
                    loading="lazy"
                  />
                </Card>
              </Box>
            ) : (
                <Box boxShadow={7}>
                  <Card className={classes.root}>
                    <Image
                      src={coverImageUrl}
                      alt="cover image"
                      width={105}
                      height={148}
                      loading="lazy"
                    />
                  </Card>
                </Box>
              )}
          </Link>

          {isMyList && onEditMode && (
            <IconButton onClick={handleDelete}>
              <ClearIcon />
            </IconButton>
          )}
        </Box>
      </motion.div>
    </Grid>
  );
};

export default BookListItem;
