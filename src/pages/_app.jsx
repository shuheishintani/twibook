import React from 'react';
import { RecoilRoot } from 'recoil';
import MobileLayout from '@/components/MobileLayout';
import Hidden from '@material-ui/core/Hidden';
import Layout from '@/components/Layout';
import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#2196f3',
    },
  },
});

function MyApp({ Component, pageProps }) {
  React.useEffect(() => {
    // Remove the server-side injected CSS.
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
}

export default MyApp;
