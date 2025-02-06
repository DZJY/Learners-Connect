import {
  createStyles,
  Text,
  Title,
  SimpleGrid,
  TextInput,
  Textarea,
  Button,
  Group,
  ActionIcon,
  rem,
} from '@mantine/core';
import { IconBrandTwitter, IconBrandYoutube, IconBrandInstagram } from '@tabler/icons-react';
// import { ContactIconsList } from '../ContactIcons/ContactIcons';
import { useState } from 'react';

const useStyles = createStyles((theme) => ({
  wrapper: {
    marginTop: '30px',
    width: '100%',
    minHeight: 400,
    boxSizing: 'border-box',
    backgroundColor: theme.colorScheme === 'dark' ? '#25262B' : theme.colors.gray[1],
    borderRadius: theme.radius.md,
    padding: `calc(${theme.spacing.xl} * 2.5)`,

    [theme.fn.smallerThan('sm')]: {
      padding: `calc(${theme.spacing.xl} * 1.5)`,
    },
  },

  title: {
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
    color: theme.colorScheme === 'dark' ? theme.white : theme.black,
    lineHeight: 1,
  },

  description: {
    color: theme.colorScheme === 'dark' ? theme.colors[theme.primaryColor][0] : theme.black,
    maxWidth: rem(300),

    [theme.fn.smallerThan('sm')]: {
      maxWidth: '100%',
    },
  },

  form: {
    backgroundColor: theme.white,
    padding: theme.spacing.xl,
    borderRadius: theme.radius.md,
    boxShadow: theme.shadows.lg,
  },

  social: {
    color: theme.colorScheme === 'dark' ? theme.colors[theme.primaryColor][0] : theme.black,

    '&:hover': {
      color: theme.colors[theme.primaryColor][8],
    },
  },

  input: {
    backgroundColor: theme.white,
    borderColor: theme.colors.gray[4],
    color: theme.black,

    '&::placeholder': {
      color: theme.colors.gray[5],
    },
  },

  inputLabel: {
    color: theme.black,
  },

  control: {
    backgroundColor: '#1870C2',
  },
  overall: {
    alignItems: 'center',
  },
}));

const social = [IconBrandTwitter, IconBrandYoutube, IconBrandInstagram];

export function ContactUs() {
  const { classes } = useStyles();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const icons = social.map((Icon, index) => (
    <ActionIcon key={index} size={28} className={classes.social} variant="transparent">
      <Icon size="1.4rem" stroke={1.5} />
    </ActionIcon>
  ));

  return (
    <div className={classes.overall}>
      <div className={classes.wrapper}>
        <SimpleGrid cols={2} spacing={50} breakpoints={[{ maxWidth: 'sm', cols: 1 }]}>
          <div>
            <Title className={classes.title}>Contact us</Title>
            <Text className={classes.description} mt="sm" mb={30}>
              Leave your email and we will get back to you within 24 hours!
            </Text>

            {/* <ContactIconsList variant="white" /> */}

            <Group mt="xl">{icons}</Group>
          </div>
          <div className={classes.form}>
            <TextInput
              label="Email"
              placeholder="hello@summaize.com"
              required
              classNames={{ input: classes.input, label: classes.inputLabel }}
            />
            <TextInput
              label="Subject"
              placeholder="Subject"
              mt="md"
              onChange={(event) => setSubject(event.target.value)}
              classNames={{ input: classes.input, label: classes.inputLabel }}
            />
            <Textarea
              required
              label="Your Message"
              placeholder="Please include all relevant information"
              minRows={4}
              mt="md"
              onChange={(event) => setMessage(event.target.value)}
              classNames={{ input: classes.input, label: classes.inputLabel }}
            />

            <Group position="right" mt="md">
              <Button
                component="a"
                href={`mailto:summaize@gmail.com?subject=${encodeURIComponent(
                  subject
                )}&body=${encodeURIComponent(message)}`}
                className={classes.control}
              >
                Send message
              </Button>
            </Group>
          </div>
        </SimpleGrid>
      </div>
    </div>
  );
}
