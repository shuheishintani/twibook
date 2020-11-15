/* eslint-disable prettier/prettier */
import { useState, useEffect } from 'react';
import { RecoilRoot, useRecoilValue } from 'recoil';
import MobileLayout from '@/layouts/MobileLayout';
import Layout from '@/layouts/Layout';
import { Hidden, CssBaseline } from '@material-ui/core';
import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';

const MyApp = ({ Component, pageProps }) => {
  const [darkMode, setDarkMode] = useState(false)
  const theme = darkMode
    ? createMuiTheme({
      palette: {
        type: 'dark',
        primary: {
          main: '#2196f3',
        },
      },
    })
    : createMuiTheme({
      palette: {
        primary: {
          main: '#2196f3',
        },
      },
    });

  useEffect(() => {
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);

  return (
    <RecoilRoot>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Hidden only={['md', 'lg', 'xl']} implementation="css">
          <MobileLayout darkMode={darkMode} setDarkMode={setDarkMode}>
            <Component {...pageProps} />
          </MobileLayout>
        </Hidden>
        <Hidden only={['xs', 'sm']} implementation="css">
          <Layout darkMode={darkMode} setDarkMode={setDarkMode}>
            <Component {...pageProps} />
          </Layout>
        </Hidden>
      </ThemeProvider>
    </RecoilRoot>
  );
};

export default MyApp;
