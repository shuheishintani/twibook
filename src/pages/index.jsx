import { dbAdmin } from '@/firebase/admin';
import Link from 'next/link';
import { makeStyles } from '@material-ui/core/styles';
import {
  Card,
  CardContent,
  Button,
  Typography,
  Grid,
  Avatar,
  Box,
} from '@material-ui/core';

const useStyles = makeStyles({
  root: {
    minWidth: 275,
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
});

const Index = ({ newUsers }) => {
  const classes = useStyles();

  return (
    <>
      <Typography variant="subtitle1">新着ユーザー</Typography>
      <Box m={3} />
      <Grid container spacing={5}>
        {newUsers.map(newUser => (
          <Grid item key={newUser.uid}>
            <Box boxShadow={7}>
              <Card className={classes.root}>
                <CardContent>
                  <Box display="flex" alignItems="flex-start">
                    <Avatar src={newUser.profileImageUrl} />
                    <Box m={1} />
                    <Box flexGrow={1}>
                      <Typography variant="subtitle1">
                        {newUser.displayName}
                      </Typography>
                      <Typography
                        variant="subtitle2"
                        className={classes.pos}
                        color="textSecondary"
                      >
                        @{newUser.username}
                      </Typography>
                    </Box>
                    {new Date(newUser.createdAt) > Date.now() - 86400000 && (
                      <Typography variant="subtitle2" color="secondary">
                        new!
                      </Typography>
                    )}
                  </Box>
                  {newUser.books.length > 0 && (
                    <Grid container spacing={1}>
                      {newUser.books.map(book => (
                        <Grid item key={book.isbn}>
                          <img
                            src={book.coverImageUrl}
                            alt=""
                            width="40"
                            height="60"
                          />
                        </Grid>
                      ))}
                    </Grid>
                  )}
                  <Box m={2} />
                  <Box display="flex" justifyContent="center">
                    <Link href={`/${newUser.username}/books`}>
                      <Button variant="outlined">本棚を見る</Button>
                    </Link>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export const getStaticProps = async () => {
  const newUsers = await dbAdmin
    .collection('users')
    .orderBy('createdAt', 'desc')
    .limit(10)
    .get()
    .then(snapshot => snapshot.docs.map(doc => doc.data()));

  const promises = await newUsers.map(async user => {
    const books = await dbAdmin
      .doc(`users/${user.uid}`)
      .collection('books')
      .limit(5)
      .get()
      .then(snapshot => snapshot.docs.map(doc => doc.data()));
    user.books = books;
    return new Promise(resolve => resolve(user));
  });

  const populatedNewUsers = await Promise.all(promises);

  const filterdNewUsers = populatedNewUsers.filter(
    user => user.books.length > 0
  );

  return {
    props: {
      newUsers: filterdNewUsers,
    },
    revalidate: 1,
  };
};

export default Index;
