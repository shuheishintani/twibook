/* eslint-disable prettier/prettier */
import Grid from '@material-ui/core/Grid';
import FriendListItem from '@/components/FriendListItem';
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
  },
  inline: {
    display: 'inline',
  },
}));

const Friends = ({ friends }) => {
  const classes = useStyles();
  return (
    <>
      {window.innerWidth > 600 ? (
        <Grid container>
          {friends.map(friend => (
            <FriendListItem key={friend.uid} friendId={friend.uid} />
          ))}
        </Grid>
      ) : (
          <List className={classes.root}>
            {friends.map(friend => (
              <FriendListItem key={friend.uid} friendId={friend.uid} />
            ))}
          </List>
        )}
    </>
  );
};

export default Friends;
