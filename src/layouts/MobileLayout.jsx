/* eslint-disable prettier/prettier */
import { useState, useEffect } from 'react';
import { db } from '@/firebase/client'
import clsx from 'clsx';
import { loginUserNotificationsState } from '@/recoil/atoms'
import { useRecoilState } from 'recoil';
import useAuthObserver from '@/hooks/useAuthObserver';
import useAuthMethods from '@/hooks/useAuthMethods';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import Avatar from '@material-ui/core/Avatar';
import TwitterIcon from '@material-ui/icons/Twitter';
import PersonIcon from '@material-ui/icons/Person';
import PeopleIcon from '@material-ui/icons/People';
import MailOutlineOutlinedIcon from '@material-ui/icons/MailOutlineOutlined';
import CancelOutlinedIcon from '@material-ui/icons/CancelOutlined';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import FiberNewIcon from '@material-ui/icons/FiberNew';
import Link from 'next/link';
import SearchIcon from '@material-ui/icons/Search';
import Box from '@material-ui/core/Box';
import ImportContactsIcon from '@material-ui/icons/ImportContacts';
import NotificationsIcon from '@material-ui/icons/Notifications';
import Badge from '@material-ui/core/Badge';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import BrightnessHighIcon from '@material-ui/icons/BrightnessHigh'
import Brightness4Icon from '@material-ui/icons/Brightness4'


const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
  },
  appBar: {
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  list: {
    width: 250,
  },
  dividerColor: {
    backgroundColor: '#2196f3',
  },
  footer: {
    width: '100%',
    height: '50px',
    'text-align': 'center',
    'bottom': 0,
  }
}));

export default function MobileLayout({ children, darkMode, setDarkMode }) {
  const classes = useStyles();
  const [state, setState] = useState(false);
  const [loginUser] = useAuthObserver();
  const [login, logout] = useAuthMethods();
  const [loginUserNotifications, setLoginUserNotifications] = useRecoilState(loginUserNotificationsState)

  useEffect(() => {
    if (loginUser) {
      const unsub = db
        .doc(`users/${loginUser.uid}`)
        .collection('notifications')
        .orderBy('createdAt', 'desc')
        .onSnapshot(snapshot => {
          let data = [];
          snapshot.forEach(doc => {
            data.push(doc.data());
          });
          setLoginUserNotifications(data);
        });
      return () => unsub();
    } else {
      setLoginUserNotifications([]);
    }
  }, [loginUser, setLoginUserNotifications]);

  const addBookNotifications =
    loginUserNotifications &&
    loginUserNotifications.filter(
      notification =>
        notification.unread === true && notification.type === 'addBook'
    );
  const newEntryNotifications =
    loginUserNotifications &&
    loginUserNotifications.filter(
      notification =>
        notification.unread === true && notification.type === 'newEntry'
    );
  const toggleDrawer = () => event => {
    if (
      event &&
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return;
    }

    setState(!state);
  };

  const list = () => (
    <div
      className={clsx(classes.list)}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >

      <div>
        {loginUser ? (
          <IconButton edge="end" color="inherit">
            <Avatar alt="profile-img" src={loginUser.profileImageUrl} />
          </IconButton>
        ) : (
            <IconButton edge="end" color="inherit">
              <Avatar alt="profile-img" />
            </IconButton>
          )}
      </div>
      <Divider />
      {!loginUser && (
        <>
          <Link href='/'>
            <ListItem button>
              <ListItemIcon>
                <FiberNewIcon />
              </ListItemIcon>
              <ListItemText primary='新着ユーザー' />
            </ListItem>
          </Link>
          <Link href='/search'>
            <ListItem button>
              <ListItemIcon>
                <SearchIcon />
              </ListItemIcon>
              <ListItemText primary='本を探す' />
            </ListItem>
          </Link>
          <ListItem button onClick={login} >
            <ListItemIcon>
              <TwitterIcon />
            </ListItemIcon>
            <ListItemText primary='ログイン' />
          </ListItem>
        </>
      )}
      {loginUser && (
        <>
          <List>
            <Link href='/'>
              <ListItem button>
                <ListItemIcon>
                  <FiberNewIcon />
                </ListItemIcon>
                <ListItemText primary='新着ユーザー' />
              </ListItem>
            </Link>
            <Link href={`/${loginUser?.username}/profile`}>
              <ListItem button disabled={!loginUser}>
                <ListItemIcon>
                  <PersonIcon />
                </ListItemIcon>
                <ListItemText primary='プロフィール' />
              </ListItem>
            </Link>
            <Link href={`/${loginUser?.username}/friends`}>
              <ListItem button disabled={!loginUser}>
                <ListItemIcon>

                  <Badge badgeContent={newEntryNotifications && newEntryNotifications.length} color="primary">
                    <PeopleIcon />

                  </Badge>
                </ListItemIcon>
                <ListItemText primary='友達' />
              </ListItem>
            </Link>
            <Link href={`/${loginUser?.username}/books`}>
              <ListItem button disabled={!loginUser}>
                <ListItemIcon>
                  <ImportContactsIcon />
                </ListItemIcon>
                <ListItemText primary='My本棚' />
              </ListItem>
            </Link>
            <Link href={`/${loginUser?.username}/notifications/1`}>
              <ListItem button disabled={!loginUser}>
                <ListItemIcon>
                  <Badge badgeContent={addBookNotifications && addBookNotifications.length} color="primary">
                    <NotificationsIcon />
                  </Badge>
                </ListItemIcon>
                <ListItemText primary='通知' />
              </ListItem>
            </Link>
            <Link href='/search'>
              <ListItem button>
                <ListItemIcon>
                  <SearchIcon />
                </ListItemIcon>
                <ListItemText primary='本を探す' />
              </ListItem>
            </Link>

          </List>
          <Divider />
          <List>
            <ListItem button onClick={logout} >
              <ListItemIcon>
                <ExitToAppIcon />
              </ListItemIcon>
              <ListItemText primary='ログアウト' />
            </ListItem>
            <Link href="/exit">
              <ListItem button >
                <ListItemIcon>
                  <CancelOutlinedIcon />
                </ListItemIcon>
                <ListItemText primary="退会" />
              </ListItem>
            </Link>
          </List>

        </>
      )}





    </div>
  );

  return (
    <div className="root">
      <AppBar
        position="fixed"
        className={clsx(classes.appBar, {
          [classes.appBarShift]: state,
        })}
        color="inherit"
        elevation={0}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={toggleDrawer()}
            edge="start"
            className={clsx(classes.menuButton, state && classes.hide)}
          >
            <MenuIcon />
          </IconButton>
          <Box flexGrow={1}>
            <Link href='/' >
              <Typography variant="h6" noWrap className={classes.logo} >
                TwiBook
                 </Typography>
            </Link>
          </Box>
          <Box>
            {darkMode ? (
              <IconButton onClick={() => setDarkMode(prev => !prev)}>
                <Brightness4Icon />
              </IconButton>
            ) : (
                <IconButton onClick={() => setDarkMode(prev => !prev)}>
                  <BrightnessHighIcon />
                </IconButton>
              )}
          </Box>
        </Toolbar>
        <Divider />
      </AppBar>
      <SwipeableDrawer
        anchor="left"
        open={state}
        onClose={toggleDrawer()}
        onOpen={toggleDrawer()}
      >
        {list('left')}
      </SwipeableDrawer>
      <Box m={10} />
      <Box m={3} >
        <Box style={{ minHeight: '100vh' }}>
          {children}
        </Box>
        <Box m={5} />
        <footer className={classes.footer}>
          <Divider />
          <p>&copy; 2020 Twibook</p>
        </footer>
      </Box>

    </div>
  );
}
