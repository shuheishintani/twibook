import { useRecoilValue } from 'recoil';
import { loginUserBooksState } from '@/recoil/atoms';
import BookListItem from './BookListItem';
import { Grid } from '@material-ui/core';

const BookList = ({ books, isMyList, onEditMode }) => {
  const loginUserBooks = useRecoilValue(loginUserBooksState);

  const loginUserBooksIsbnList = loginUserBooks.map(book => book.isbn);

  return (
    <Grid container spacing={5}>
      {books.map((book, index) => (
        <BookListItem
          book={book}
          isMyList={isMyList}
          onEditMode={onEditMode}
          loginUserBooksIsbnList={loginUserBooksIsbnList}
          key={index}
        />
      ))}
    </Grid>
  );
};

export default BookList;
