import React, { ReactNode } from 'react';
import { HeaderMegaMenu } from './Header';
import { FooterLinks } from './Footer';
import Chatbot from '../Chatbot/Chatbot';
import { useSession } from 'next-auth/react';

type LayoutProps = {
  children: ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  const { data: session} = useSession();
  
  const allLinks = [
      {
        title: 'Features',
        links: [
          {
            label:'View All Notes',
            link: '/all-notes',
          },
          {
            label:'Upload Notes',
            link: '/new-upload',
          },
          {
            label:'My Notes',
            link:'/my-notes',
          },
          {
            label:'Forum',
            link:'/forum',
          },
        ]
      }
  ];

  const halfLinks = [
      {
        title: 'Features',
        links: [
          {
            label:'View All Notes',
            link: '/all-notes',
          },
        ]
      }
  ];


  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <HeaderMegaMenu />
      <div style={{ flex: '1 0 auto' }}>{children}</div>
      <Chatbot />
      {session && <FooterLinks data={allLinks} />}
      {!session && <FooterLinks data={halfLinks} />}
    </div>
  );
};

export default Layout;
