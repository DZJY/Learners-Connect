import { IconBookmark, IconShare } from '@tabler/icons-react';
import {
  Card,
  Image,
  Text,
  ActionIcon,
  Badge,
  Group,
  Center,
  Avatar,
  createStyles,
  rem,
} from '@mantine/core';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { useModalContext } from '../contexts/ModalContext';

const useStyles = createStyles((theme) => ({
  card: {
    position: 'relative',
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
  },

  rating: {
    position: 'absolute',
    top: theme.spacing.xs,
    right: rem(12),
    pointerEvents: 'none',
  },

  title: {
    display: 'block',
    marginTop: theme.spacing.md,
    marginBottom: rem(5),
  },

  action: {
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
    ...theme.fn.hover({
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[1],
    }),
  },

  footer: {
    marginTop: theme.spacing.md,
  },
}));

interface ArticleCardProps {
  articleId: string;
  image: string;
  link: string;
  title: string;
  description: string;
  removeNote?: (noteId: string) => void;
  rating: string;
  author: {
    name: string;
    image: string;
  };
}

export default function ArticleCard({
  key,
  articleId,
  className,
  image,
  link,
  title,
  description,
  removeNote,
  author,
  rating,
  ...others
}: ArticleCardProps & Omit<React.ComponentPropsWithoutRef<'div'>, keyof ArticleCardProps>) {
  const { classes, cx, theme } = useStyles();
  const { data: session } = useSession();
  const email = session?.user?.email;
  const linkProps = { href: link, rel: 'noopener noreferrer' };
  const [isBookmarked, setIsBookmarked] = useState(false);
  const { openModal } = useModalContext(); // <-- use the hook to access openModal

  // Fetch bookmark status when component mounts
  useEffect(() => {
    const fetchBookmarkStatus = async () => {
      try {
        const response = await axios.get(
          `/api/manageBookmarks?email=${email}&articleId=${articleId}`
        );
        setIsBookmarked(response.data.isBookmarked);
      } catch (error) {
        console.error('Error fetching bookmark status:', error);
      }
    };

    fetchBookmarkStatus();
  }, [email, articleId]); // Depend on email and articleId so it reruns if these change

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out this article',
          url: link,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback for unsupported browsers
      alert(
        'Your browser does not support the share API. Please use Google Chrome or Edge instead, thank you!'
      );
    }
  };

  const handleBookmark = async () => {
    if (!session) {
      // If user is not logged in, open the modal and do not proceed further
      openModal();
      return;
    }
    try {
      let response;
      if (isBookmarked) {
        // If currently bookmarked, send DELETE request to remove bookmark
        response = await axios.delete('/api/manageBookmarks', { data: { email, articleId } });
        removeNote && removeNote(articleId); // remove the note from the UI after it's removed from the database
      } else {
        // If not bookmarked, send POST request to add bookmark
        response = await axios.post('/api/manageBookmarks', { email, articleId });
      }
      console.log(response.data);
      // Toggle isBookmarked state after successful operation
      setIsBookmarked(!isBookmarked);
    } catch (error) {
      console.error('Error updating bookmark:', error);
    }
  };

  return (
    <Card withBorder radius="md" className={cx(classes.card, className)} {...others}>
      <Card.Section>
        <a {...linkProps}>
          <Image src={image} height={180} />
        </a>
      </Card.Section>

      <Badge className={classes.rating} variant="gradient" gradient={{ from: 'yellow', to: 'red' }}>
        {rating}
      </Badge>

      <Text className={classes.title} fw={500} component="a" {...linkProps}>
        {title}
      </Text>

      <Text fz="sm" color="dimmed" lineClamp={4}>
        {description}
      </Text>

      <Group position="apart" className={classes.footer}>
        <Center>
          <Avatar src={author.image} size={24} radius="xl" mr="xs" />
          <Text fz="sm" inline>
            {author.name}
          </Text>
        </Center>

        <Group spacing={8} mr={0}>
          <ActionIcon className={classes.action} onClick={handleBookmark}>
            <IconBookmark
              size="1rem"
              color={isBookmarked ? theme.colors.teal[7] : theme.colors.red[7]}
            />
          </ActionIcon>
          <ActionIcon className={classes.action} onClick={handleShare}>
            <IconShare size="1rem" />
          </ActionIcon>
        </Group>
      </Group>
    </Card>
  );
}
