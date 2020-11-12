import Grid from '@material-ui/core/Grid';
import FriendListItem from '@/components/FriendListItem';

const Friends = ({ friends }) => {
  return (
    <Grid container>
      {friends.map(friend => (
        <FriendListItem key={friend.uid} friendId={friend.uid} />
      ))}
    </Grid>
  );
};

export default Friends;
