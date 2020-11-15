/* eslint-disable prettier/prettier */
import { useState, useEffect } from 'react';
import { db } from '@/firebase/client';
import { useRecoilState } from 'recoil';
import { loginUserNotificationsState } from '@/recoil/atoms';
import useAuthObserver from '@/hooks/useAuthObserver';
import useAuthMethods from '@/hooks/useAuthMethods';
import Link from 'next/link';
import clsx from 'clsx';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import {
  Drawer,
  CssBaseline,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  Avatar,
  ListItem,
  ListItemIcon,
  ListItemText,
  Badge,
  Box
} from '@material-ui/core';

import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Twitter as TwitterIcon,
  Person as PersonIcon,
  People as PeopleIcon,
  ExitToApp as ExitToAppIcon,
  Search as SearchIcon,
  ImportContacts as ImportContactsIcon,
  Notifications as NotificationsIcon,
  CancelOutlined as CancelOutlinedIcon,
  MailOutlineOutlined as MailOutlineOutlinedIcon,
  FiberNew as FiberNewIcon
} from '@material-ui/icons';

const drawerWidth = 240;

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
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  hide: {
    display: 'none',
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'space-between',
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: -drawerWidth,
    // minHeight: '100%'
  },
  contentShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  },
  dividerColor: {
    backgroundColor: '#2196f3',
  },
  logo: {
    '&:hover': {
      cursor: 'pointer',
    },
  },
  footer: {
    width: '100%',
    height: '50px',
    'text-align': 'center',
    'bottom': 0,
  }
}));

export default function Layout({ children }) {
  const classes = useStyles();
  const theme = useTheme();
  const [loginUser] = useAuthObserver();
  const [login, logout] = useAuthMethods();
  const [open, setOpen] = useState(true);
  const [loginUserNotifications, setLoginUserNotifications] = useRecoilState(
    loginUserNotificationsState
  );

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

  const unreadNotifications =
    loginUserNotifications &&
    loginUserNotifications.filter(notification => notification.unread === true);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar
        position="fixed"
        className={clsx(classes.appBar, {
          [classes.appBarShift]: open,
        })}
        color="inherit"
        elevation={0}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            className={clsx(classes.menuButton, open && classes.hide)}
          >
            <MenuIcon />
          </IconButton>
          <Link href='/' >
            <Typography variant="h6" noWrap className={classes.logo}>
              TwiBook
          </Typography>
          </Link>

        </Toolbar>
        <Divider />
      </AppBar>
      <Drawer
        className={classes.drawer}
        variant="persistent"
        anchor="left"
        open={open}
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        <div className={classes.drawerHeader}>
          {loginUser && (
            <Avatar alt="profile-img" src={loginUser.profileImageUrl} />
          )}

          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <Avatar />}
          </IconButton>
        </div>
        <Divider />
        {!loginUser && (
          <List>
            <Link href='/'>
              <ListItem button>
                <ListItemIcon>
                  <FiberNewIcon />
                </ListItemIcon>
                <ListItemText primary='新着ユーザー' />
              </ListItem>
            </Link>
            <Link href="/search">
              <ListItem button>
                <ListItemIcon>
                  <SearchIcon />
                </ListItemIcon>
                <ListItemText primary="本を探す" />
              </ListItem>
            </Link>
            <ListItem button onClick={login}>
              <ListItemIcon>
                <TwitterIcon />
              </ListItemIcon>
              <ListItemText primary="ログイン" />
            </ListItem>
          </List>
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
                  <ListItemText primary="プロフィール" />
                </ListItem>
              </Link>

              <Link href={`/${loginUser?.username}/friends`}>
                <ListItem button disabled={!loginUser}>
                  <ListItemIcon>
                    <PeopleIcon />
                  </ListItemIcon>
                  <ListItemText primary="友達" />
                </ListItem>
              </Link>

              <Link href={`/${loginUser?.username}/books`}>
                <ListItem button disabled={!loginUser}>
                  <ListItemIcon>
                    <ImportContactsIcon />
                  </ListItemIcon>
                  <ListItemText primary="My本棚" />
                </ListItem>
              </Link>

              <Link href={`/${loginUser?.username}/notifications/1`}>
                <ListItem button disabled={!loginUser}>
                  <ListItemIcon>
                    <Badge
                      badgeContent={
                        unreadNotifications && unreadNotifications.length
                      }
                      color="primary"
                    >
                      <NotificationsIcon />
                    </Badge>
                  </ListItemIcon>
                  <ListItemText primary="通知" />
                </ListItem>
              </Link>

              <Link href="/search">
                <ListItem button>
                  <ListItemIcon>
                    <SearchIcon />
                  </ListItemIcon>
                  <ListItemText primary="本を探す" />
                </ListItem>
              </Link>
            </List>
            <Divider />
            <List>
              <ListItem button onClick={logout}>
                <ListItemIcon>
                  <ExitToAppIcon />
                </ListItemIcon>
                <ListItemText primary="ログアウト" />
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
      </Drawer>
      <main
        className={clsx(classes.content, {
          [classes.contentShift]: open,
        })}
      >
        <div className={classes.drawerHeader} />
        <Box style={{ minHeight: '100vh' }}>
          {children}
        </Box>
        <Box m={10} />
        <footer className={classes.footer}>
          <Divider />
          <p>&copy; 2020 Twibook</p>
        </footer>
      </main>

    </div >
  );
}
