import { dbAdmin } from '@/firebase/admin';
import Link from 'next/link';
import { fetchBookByIsbn } from '@/lib/rakutenBookApi';
import { Avatar, Typography, Box, Divider, Button } from '@material-ui/core';
import AvatarGroup from '@material-ui/lab/AvatarGroup';
import { motion } from 'framer-motion';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() => ({
  root: {
    cursor: 'pointer',
  },
  amazonBtn: {
    textTransform: 'none',
  },
}));

const toISBN10 = isbn13 => {
  const src = isbn13.slice(3, 12);

  const sum = src
    .split('')
    .map(s => parseInt(s))
    .reduce((p, c, i) => (i === 1 ? p * 10 : p) + c * (10 - i));

  const rem = 11 - (sum % 11);
  const checkdigit = rem === 11 ? 0 : rem === 10 ? 'X' : rem;

  return `${src}${checkdigit}`;
};

const BookDetail = ({ book, readers }) => {
  const classes = useStyles();

  return (
    <>
      <Box display="flex">
        <img
          src={book.coverImageUrl}
          alt="cover_img"
          width="105"
          height="148"
        />
        <Box m={1} />
        <Box>
          <Box m={1} />
          <Typography variant="subtitle1">{book.title}</Typography>
          <Box m={2} />
          <Typography variant="subtitle2">
            {book.author} （{book.publisherName}）
          </Typography>
          <Box m={2} />
          <Typography variant="subtitle2"></Typography>
          <p>¥{book.price}</p>
          <p>{book.salesDate}</p>
        </Box>
      </Box>

      <Box m={3} />
      <Typography variant="subtitle2">{book.description}</Typography>
      <Box m={3} />

      <Button
        variant="outlined"
        onClick={() => {
          window.open(
            `http://www.amazon.co.jp/dp/${toISBN10(
              book.isbn
            )}/ref=noism?tag=twibook-22`
          );
        }}
        className={classes.amazonBtn}
      >
        <img src="/amazon.png" alt="amazon_logo" width="20" height="20" />
        <Box m={1} />
        Amazonで購入する
      </Button>
      <Box m={3} />

      <Divider />
      <Box m={3} />
      <Typography variant="subtitle2">この本を読んだ友達</Typography>
      <Box m={1} />
      {readers && (
        <AvatarGroup>
          {readers.map(reader => (
            <motion.div
              key={reader.uid}
              whileHover={{ scale: 1.1 }}
              className={classes.root}
            >
              <Link href={`/${reader.username}/books`}>
                <Avatar alt="profile-img" src={reader.profileImageUrl} />
              </Link>
            </motion.div>
          ))}
        </AvatarGroup>
      )}
    </>
  );
};

export default BookDetail;

export const getServerSideProps = async ctx => {
  const { isbn } = ctx.query;

  const bookData = await fetchBookByIsbn(isbn);
  const {
    title,
    author,
    publisherName,
    coverImageUrl,
    description,
    price,
    salesDate,
  } = bookData;

  const readerIds = await dbAdmin
    .collectionGroup('books')
    .where('isbn', '==', isbn)
    .get()
    .then(snapshot => {
      let readerIds = [];
      snapshot.forEach(doc => {
        readerIds.push(doc.data().ownerId);
      });
      return readerIds;
    });

  const readerRefs = readerIds.map(id => dbAdmin.doc(`users/${id}`));
  const readers = await dbAdmin.getAll(...readerRefs).then(snapshot => {
    return snapshot.map(doc => doc.data());
  });

  return {
    props: {
      book: {
        isbn,
        title,
        author,
        publisherName,
        coverImageUrl,
        description,
        price,
        salesDate,
      },
      readers,
    },
  };
};
