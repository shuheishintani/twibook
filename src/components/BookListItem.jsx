import React, { useState } from 'react';
import firebase, { db } from '@/firebase/client';
import { useRecoilValue, useRecoilState } from 'recoil';
import { loginUserState, loginUserBooksState } from '@/recoil/atoms';
import Image from 'next/image';
import Link from 'next/link';
import { Grid, Box, IconButton } from '@material-ui/core';
import ClearIcon from '@material-ui/icons/Clear';
import { motion } from 'framer-motion';

const BookListItem = ({ book, isMyList, onEditMode }) => {
  const [exists, setExists] = useState(true);
  const loginUser = useRecoilValue(loginUserState);
  const [loginUserBooks, setLoginUserBooks] = useRecoilState(
    loginUserBooksState
  );

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
      <motion.div className="img-wrap" layout whileHover={{ opacity: 1 }}>
        <Box display="flex" alignItems="flex-start">
          <Link href={`/books/${book.isbn}`}>
            <Box boxShadow={7}>
              <Image
                src={coverImageUrl}
                alt="cover image"
                width={105}
                height={148}
                loading="lazy"
              />
            </Box>
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
