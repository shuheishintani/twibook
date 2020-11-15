/* eslint-disable prettier/prettier */
import Link from 'next/link';
import { Divider, Typography, Box, Avatar } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  hoverUnderline: {
    '&:hover': {
      textDecoration: 'underline',
      cursor: 'pointer',
    },
  },
}));

const NotificationsList = ({ notifications }) => {
  const classes = useStyles();
  return (
    <>
      {notifications.map((notification, index) => {
        return (
          <Box key={index}>
            <Box display="flex" alignItems="center">
              <Avatar src={notification.createdBy.profileImageUrl} />
              <Box m={1} />
              <Box>
                {notification.type === 'addBook' ? (
                  <p>
                    <Link href={`/books/${notification.book.isbn}`}>
                      <span className={classes.hoverUnderline}>
                        {notification.message}{' '}
                      </span>
                    </Link>
                    {new Date(notification.createdAt) >
                      Date.now() - 86400000 && (
                        <span style={{ color: '#f50057' }}>new!</span>
                      )}{' '}
                  </p>
                ) : (
                    <p>
                      {notification.message}{' '}
                      {new Date(notification.createdAt) >
                        Date.now() - 86400000 && (
                          <span style={{ color: '#f50057' }}>new!</span>
                        )}
                    </p>
                  )}
                <Typography variant="body2" color="textSecondary">
                  {notification.createdAt}
                </Typography>
              </Box>
            </Box>
            <Box m={1} />
            <Divider />
          </Box>
        );
      })}
    </>
  );
};

export default NotificationsList;
