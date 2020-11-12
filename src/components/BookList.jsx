import BookListItem from './BookListItem';
import { Grid } from '@material-ui/core';

const BookList = ({ books, isMyList, onEditMode }) => {
  return (
    <Grid container spacing={window.innerWidth > 600 ? 5 : 2}>
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
