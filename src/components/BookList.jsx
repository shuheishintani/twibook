import BookListItem from './BookListItem';
import { Grid } from '@material-ui/core';

const BookList = ({ books, isMyList, onEditMode }) => {
  return (
    <Grid container spacing={5}>
      {books.map((book, index) => (
        <BookListItem
          book={book}
          isMyList={isMyList}
          onEditMode={onEditMode}
          key={index}
        />
      ))}
    </Grid>
  );
};

export default BookList;
