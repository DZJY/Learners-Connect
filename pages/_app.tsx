import { useState } from 'react';
import NextApp, { AppProps, AppContext } from 'next/app';
import { getCookie, setCookie } from 'cookies-next';
import Head from 'next/head';
import { MantineProvider, ColorScheme, ColorSchemeProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import Layout from '../components/navigation/Layout';
import { SessionProvider, useSession } from 'next-auth/react';
import { ModalProvider } from '../contexts/ModalContext';
import { useRouter } from 'next/router';

const protectedRoutes = [
  '/my-notes',
  '/new-upload',
  '/forum',
];

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  if (!session && protectedRoutes.includes(router.pathname)) {
    router.replace('/'); // Redirect to main if not authenticated
    return null;
  }

  return <>{children}</>;
}

export default function App(props: AppProps & { colorScheme: ColorScheme }) {
  const { Component, pageProps } = props;
  const [colorScheme, setColorScheme] = useState<ColorScheme>(props.colorScheme);

  const toggleColorScheme = (value?: ColorScheme) => {
    const nextColorScheme = value || (colorScheme === 'dark' ? 'light' : 'dark');
    setColorScheme(nextColorScheme);
    setCookie('mantine-color-scheme', nextColorScheme, { maxAge: 60 * 60 * 24 * 30 });
  };

  return (
    <>
      <Head>
        <title>learnersConnect</title>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
        <link rel="shortcut icon" href="/logo.svg" />
      </Head>

      <MantineProvider theme={{ colorScheme }} withGlobalStyles withNormalizeCSS>
        <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
          <SessionProvider session={pageProps.session}>
            <ModalProvider>
              <Layout>
                <AuthGuard>
                  <Component {...pageProps} />
                </AuthGuard>
                <Notifications />
              </Layout>
            </ModalProvider>
          </SessionProvider>
        </ColorSchemeProvider>
      </MantineProvider>
    </>
  );
}

App.getInitialProps = async (appContext: AppContext) => {
  const appProps = await NextApp.getInitialProps(appContext);
  return {
    ...appProps,
    colorScheme: getCookie('mantine-color-scheme', appContext.ctx) || 'dark',
  };
};
