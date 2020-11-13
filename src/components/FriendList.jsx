/* eslint-disable prettier/prettier */
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
      <List className={classes.root}>
        {friends.map(friend => (
          <FriendListItem key={friend.uid} friendId={friend.uid} />
        ))}
      </List>
    </>
  );
};

export default Friends;
