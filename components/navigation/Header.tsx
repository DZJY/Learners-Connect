import {
  createStyles,
  Header,
  Group,
  Button,
  UnstyledButton,
  Text,
  ThemeIcon,
  Divider,
  Center,
  Box,
  Burger,
  Drawer,
  Collapse,
  ScrollArea,
  rem,
  Modal,
  Avatar,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconNotification,
  IconCode,
  IconBook,
  IconChartPie3,
  IconFingerprint,
  IconCoin,
  IconChevronDown,
  IconHome2,
  IconBookmarks,
  IconNotes,
  IconBookUpload,
} from '@tabler/icons-react';
import Link from 'next/link';
import { ColorSchemeToggle } from '../ColorSchemeToggle/ColorSchemeToggle';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { AuthenticationForm } from '../AuthForm';
import SummAIzeLogo from '../../images/summAIze.png';
import { StaticImageData } from 'next/image';
import { useModalContext } from '../../contexts/ModalContext'; // adjust the path accordingly

const useStyles = createStyles((theme) => ({
  link: {
    display: 'flex',
    alignItems: 'center',
    height: 'auto', // Adjust this
    padding: theme.spacing.lg,
    textDecoration: 'none',
    color: theme.colorScheme === 'dark' ? theme.white : theme.black,
    fontWeight: 500,
    fontSize: theme.fontSizes.sm,

    [theme.fn.smallerThan('sm')]: {
      height: rem(42), // You might want to adjust this as well
      display: 'flex',
      alignItems: 'center',
      width: '100%',
    },

    ...theme.fn.hover({
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
    }),
  },

  subLink: {
    width: '100%',
    padding: `${theme.spacing.xs} ${theme.spacing.md}`,
    borderRadius: theme.radius.md,

    ...theme.fn.hover({
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[0],
    }),

    '&:active': theme.activeStyles,
  },

  dropdownFooter: {
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[0],
    margin: `calc(${theme.spacing.md} * -1)`,
    marginTop: theme.spacing.sm,
    padding: `${theme.spacing.md} calc(${theme.spacing.md} * 2)`,
    paddingBottom: theme.spacing.xl,
    borderTop: `${rem(1)} solid ${
      theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[1]
    }`,
  },

  hiddenMobile: {
    [theme.fn.smallerThan('sm')]: {
      display: 'none',
    },
  },

  hiddenDesktop: {
    [theme.fn.largerThan('sm')]: {
      display: 'none',
    },
  },
  header: {
    height: '70px',
    maxHeight: '100px',
  },
}));

const mockdata = [
  {
    icon: IconCode,
    title: 'Open source',
    description: 'This Pokémon’s cry is very loud and distracting',
  },
  {
    icon: IconCoin,
    title: 'Free for everyone',
    description: 'The fluid of Smeargle’s tail secretions changes',
  },
  {
    icon: IconBook,
    title: 'Documentation',
    description: 'Yanma is capable of seeing 360 degrees without',
  },
  {
    icon: IconFingerprint,
    title: 'Security',
    description: 'The shell’s rounded shape and the grooves on its.',
  },
  {
    icon: IconChartPie3,
    title: 'Analytics',
    description: 'This Pokémon uses its flying ability to quickly chase',
  },
  {
    icon: IconNotification,
    title: 'Notifications',
    description: 'Combusken battles with the intensely hot flames it spews',
  },
];

export function HeaderMegaMenu() {
  const logoSrc = (SummAIzeLogo as StaticImageData).src;
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);
  const [linksOpened, { toggle: toggleLinks }] = useDisclosure(false);
  const { classes, theme } = useStyles();
  const { data: session } = useSession();

  // Get the context state and methods
  const { modalOpen, openModal, closeModal } = useModalContext();
  const links = mockdata.map((item) => (
    <UnstyledButton className={classes.subLink} key={item.title}>
      <Group noWrap align="flex-start">
        <ThemeIcon size={34} variant="default" radius="md">
          <item.icon size={rem(22)} color={theme.fn.primaryColor()} />
        </ThemeIcon>
        <div>
          <Text size="sm" fw={500}>
            {item.title}
          </Text>
          <Text size="xs" color="dimmed">
            {item.description}
          </Text>
        </div>
      </Group>
    </UnstyledButton>
  ));

  return (
    <Box pb="md">
      <Header height={60} px="md" className={classes.header}>
        <Group position="apart" sx={{ height: '100%', marginBottom: '80px' }}>
          <Link href="/">
            <img src={logoSrc} alt="SummAIze Logo" style={{ width: '130px', height: 'auto' }} />
          </Link>
          <Group sx={{ height: '100%' }} spacing={0} my={0} className={classes.hiddenMobile}>
            <Link href="/" className={classes.link}>
              <IconHome2 size={20} />
              Home
            </Link>

            {session && (
              <Link href="/bookmarks" className={classes.link}>
                <IconBookmarks size={20} />
                Bookmarks
              </Link>
            )}
            <Link href="/all-notes" className={classes.link}>
              <IconNotes size={20} />
              All Notes
            </Link>
            <Link href="/new-upload" className={classes.link}>
              <IconBookUpload size={20} />
              Upload New
            </Link>
          </Group>
          <Group sx={{ height: '100%' }} spacing={10} my={0} className={classes.hiddenMobile}>
            {session ? (
              <>
                <Group sx={{ height: '100%' }} align="center">
                  <ColorSchemeToggle />
                  <Avatar radius="xl" />
                  <Text>{session?.user?.name}</Text>
                  <Button variant="default" onClick={() => signOut()}>
                    Sign Out
                  </Button>
                </Group>
              </>
            ) : (
              <>
                <ColorSchemeToggle />
                <Button variant="default" onClick={openModal}>
                  {' '}
                  Sign In
                </Button>
              </>
            )}
            {modalOpen && (
              <Modal onClose={closeModal} opened={modalOpen}>
                <AuthenticationForm />
              </Modal>
            )}
          </Group>

          <Burger opened={drawerOpened} onClick={toggleDrawer} className={classes.hiddenDesktop} />
        </Group>
      </Header>

      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        size="100%"
        padding="md"
        title="Navigation"
        className={classes.hiddenDesktop}
        zIndex={1000000}
      >
        <ScrollArea h={`calc(100vh - ${rem(60)})`} mx="-md">
          <Divider my="sm" color={theme.colorScheme === 'dark' ? 'dark.5' : 'gray.1'} />

          <Link href="/" className={classes.link}>
            Home
          </Link>
          <UnstyledButton className={classes.link} onClick={toggleLinks}>
            <Center inline>
              <Box component="span" mr={5}>
                Features
              </Box>
              <IconChevronDown size={16} color={theme.fn.primaryColor()} />
            </Center>
          </UnstyledButton>
          <Collapse in={linksOpened}>{links}</Collapse>
          <Link href="/bookmarks" className={classes.link}>
            Bookmarks
          </Link>
          <Link href="/all-notes" className={classes.link}>
            All Notes
          </Link>
          <Link href="/new-upload" className={classes.link}>
            Upload New
          </Link>

          <Divider my="sm" color={theme.colorScheme === 'dark' ? 'dark.5' : 'gray.1'} />

          <Group position="center" grow pb="xl" px="md">
            {session ? (
              <Button variant="default" onClick={() => signOut()}>
                Sign Out
              </Button>
            ) : (
              <Button variant="default" onClick={openModal}>
                {' '}
                Sign In
              </Button>
            )}
          </Group>
        </ScrollArea>
      </Drawer>
    </Box>
  );
}
