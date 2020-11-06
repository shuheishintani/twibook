import React, { useState, useCallback } from 'react';
import { TextField, Box, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import BookCard from '@/components/BookCard';
import { fetchBooksByKeyword } from '@/lib/rakutenBookApi';
import InfiniteScroll from 'react-infinite-scroller';

const useStyles = makeStyles(() => ({
  root: {
    width: '250px',
  },
  submitBtn: {
    height: '40px',
  },
}));

const Search = () => {
  const classes = useStyles();
  const [books, setBooks] = useState([]);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleTitleInput = useCallback(e => {
    setTitle(e.target.value);
  }, []);

  const handleAuthorInput = useCallback(e => {
    setAuthor(e.target.value);
  }, []);

  const handleSubmit = useCallback(
    async e => {
      e.preventDefault();
      setHasMore(true);
      setBooks([]);

      if (!title && !author) {
        return;
      }

      setLoading(true);
      const booksData = await fetchBooksByKeyword(title, author, 1);
      if (booksData) {
        setBooks(booksData);
        setPage(2);
        setLoading(false);
      } else {
        setBooks([]);
        setLoading(false);
      }
    },
    [author, title]
  );

  const handleNextLoad = useCallback(async () => {
    if (!title && !author) {
      return;
    }

    setLoading(true);
    const booksData = await fetchBooksByKeyword(title, author, page);
    if (booksData.length !== 0) {
      setTimeout(() => {
        setBooks(prev => [...prev, ...booksData]);
        setPage(prev => prev + 1);
        setLoading(false);
      }, 1000);
    } else {
      setHasMore(false);
      setLoading(false);
    }
  }, [author, page, title]);

  const handleClear = useCallback(() => {
    setTitle('');
    setAuthor('');
    setPage(1);
  }, []);

  return (
    <>
      <form noValidate autoComplete="off">
        <Box display="flex" alignItems="flex-end">
          <TextField
            id="filled-basic"
            variant="filled"
            color="secondary"
            label="タイトル"
            value={title}
            onChange={handleTitleInput}
            className={classes.root}
          />
          <Box m={1} />
          <TextField
            id="filled-basic"
            variant="filled"
            color="secondary"
            label="著者"
            value={author}
            onChange={handleAuthorInput}
            className={classes.root}
          />
          <Box m={1} />
          <Button
            type="submit"
            variant="outlined"
            onClick={handleSubmit}
            className={classes.submitBtn}
          >
            検索
          </Button>
          <Box m={1} />
          <Button
            variant="outlined"
            onClick={handleClear}
            className={classes.submitBtn}
          >
            クリア
          </Button>
        </Box>
      </form>

      <Box m={3} />
      <InfiniteScroll
        pageStart={0}
        loadMore={handleNextLoad}
        hasMore={hasMore}
        initialLoad={false}
      >
        <Grid container spacing={5}>
          {books.map((book, index) => (
            <BookCard book={book} key={index} />
          ))}
        </Grid>
      </InfiniteScroll>
      {loading && <p>Loading...</p>}
    </>
  );
};

export default Search;
