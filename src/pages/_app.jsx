import React from 'react';
import { RecoilRoot } from 'recoil';
import MobileLayout from '@/layouts/MobileLayout';
import Layout from '@/layouts/Layout';
import { Hidden, CssBaseline } from '@material-ui/core';
import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';

const theme = createMuiTheme({
  palette: {
    type: 'dark',
    primary: {
      main: '#2196f3',
    },
  },
});

const MyApp = ({ Component, pageProps }) => {
  React.useEffect(() => {
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
          <MobileLayout>
            <Component {...pageProps} />
          </MobileLayout>
        </Hidden>
        <Hidden only={['xs', 'sm']} implementation="css">
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </Hidden>
      </ThemeProvider>
    </RecoilRoot>
  );
};

export default MyApp;
