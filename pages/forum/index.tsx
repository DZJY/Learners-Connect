import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  Card,
  Textarea,
  Button,
  Input,
  Text,
  Modal,
  Avatar,
  Group,
  ActionIcon,
  LoadingOverlay,
  createStyles,
  Center,
} from '@mantine/core';
import { IconSend, IconMessageCircle, IconBookmark, IconShare } from '@tabler/icons-react';

type Post = {
  _id: string;
  title: string;
  content: string;
  ownerId: { name: string; email: string };
  comments: { _id: string; commenterId: { name: string }; text: string; timestamp: string }[];
  createdAt: string;
  updatedAt: string;
};

const useStyles = createStyles((theme) => ({
  card: {
    marginTop: '50px',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: theme.spacing.md,
    justifyContent: 'center',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
  },
  postCard: {
    cursor: 'pointer',
    transition: 'box-shadow 0.3s ease',
    '&:hover': {
      boxShadow: theme.shadows.md,
    },
  },
}));

export default function ForumPage() {
  const { classes } = useStyles();
  const { data: session } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // ✅ Get logged-in user's email and name
  const userEmail = session?.user?.email ?? '';
  const userName = session?.user?.name ?? 'Anonymous';

  // ✅ Fetch posts from the API
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/forum');
        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error('Invalid response format');
        }
        setPosts(data);
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError('Failed to fetch posts. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // ✅ Handle new post submission
  const handlePostSubmit = async () => {
    if (postTitle.trim() && postContent.trim()) {
      try {
        const payload = {
          title: postTitle,
          content: postContent,
          // email: userEmail, // ✅ Use logged-in user's email
          // name: userName, // ✅ Use logged-in user's name
          email: "test12@gmail.com",
          name: "test12",
        };

        const response = await fetch('/api/forum', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }

        const data = await response.json();
        setPosts([...posts, data.post]);
        setPostTitle('');
        setPostContent('');
      } catch (err) {
        console.error('Error creating post:', err);
        setError('Failed to create post. Please try again.');
      }
    }
  };

  // ✅ Handle new comment submission
  const handleCommentSubmit = async (postId: string) => {
    const comment = commentInputs[postId];
    if (comment?.trim()) {
      try {
        if (!session?.user?.email) {
          throw new Error('User email is missing in session.');
        }

        const payload = {
          postId,
          //email: session.user.email, // ✅ Send email instead of user ID
          email: 'test12@gmail.com',
          text: comment,
        };

        console.log('📤 Sending Comment Payload:', payload);

        const response = await fetch('/api/forum/comments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        console.log('Response Status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Request failed: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('✅ Received Comment Response:', data);

        setSelectedPost(data.post);
        setCommentInputs({ ...commentInputs, [postId]: '' });

        setPosts((prevPosts) => prevPosts.map((p) => (p._id === data.post._id ? data.post : p)));
      } catch (err) {
        console.error('Error adding comment:', err);
        setError('Failed to add comment. Please try again.');
      }
    }
  };

  if (isLoading) {
    return <LoadingOverlay visible zIndex={10} />;
  }

  if (error) {
    return (
      <Center>
        <Text color="red">{error}</Text>
      </Center>
    );
  }

  return (
    <div className={classes.header}>
      <h1>Forum</h1>

      {/* ✅ Display Logged-in User */}
      {session ? (
        <Text size="sm" color="gray">
          Logged in as: {userName} ({userEmail})
        </Text>
      ) : (
        <Text size="sm" color="red">
          Please log in to post
        </Text>
      )}
      {/* New Post */}
      <Card shadow="sm" p="lg" withBorder className={classes.postCard}>
        <Input
          value={postTitle}
          onChange={(e) => setPostTitle(e.target.value)}
          placeholder="Enter discussion title..."
          mt="md"
        />
        <Textarea
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
          placeholder="Write your discussion content..."
          autosize
          minRows={2}
          mt="md"
        />
        <Button
          leftIcon={<IconSend size={16} />}
          onClick={handlePostSubmit}
          mt="md"
          disabled={!session}
        >
          Post
        </Button>
      </Card>

      {/* Posts */}
      <div className={classes.card}>
        {posts.map((post) => (
          <Card
            key={post._id}
            shadow="sm"
            p="lg"
            withBorder
            className={classes.postCard}
            onClick={() => setSelectedPost(post)}
          >
            <Text weight={600} size="lg" mt="md">
              {post.title}
            </Text>
            <Text size="sm" color="gray">
              {post.content}
            </Text>
            <Group position="apart" mt="md">
              <Group>
                <Avatar size={30} src="https://picsum.photos/30" />
                <Text size="sm">{post.ownerId?.name || 'Anonymous'}</Text>
              </Group>
              <Group>
                <ActionIcon variant="subtle" color="gray">
                  <IconBookmark size={18} />
                </ActionIcon>
                <ActionIcon variant="subtle" color="gray">
                  <IconShare size={18} />
                </ActionIcon>
              </Group>
            </Group>
          </Card>
        ))}
      </div>

      {/* Post Modal */}
      {selectedPost && (
        <Modal
          opened={Boolean(selectedPost)}
          onClose={() => setSelectedPost(null)}
          title={selectedPost.title}
          size="lg"
        >
          <Text>{selectedPost.content}</Text>
          <Text size="sm" color="gray">
            Posted by: {selectedPost.ownerId?.name || 'Anonymous'}
          </Text>
          {/* Display Comments */}
          <div className="mt-4">
            {selectedPost.comments.map((comment) => (
              <div key={comment._id} className="ml-4 border-l pl-2 mt-2">
                <Text size="sm" weight={500}>
                  {comment.commenterId?.name || 'Anonymous'} {/* ✅ Display username */}
                </Text>
                <Text size="sm">{comment.text}</Text>
              </div>
            ))}
          </div>
          <Input
            value={commentInputs[selectedPost._id] || ''}
            onChange={(e) =>
              setCommentInputs({ ...commentInputs, [selectedPost._id]: e.target.value })
            }
            placeholder="Write a comment..."
          />
          <Button size="sm" onClick={() => handleCommentSubmit(selectedPost._id)}>
            Comment
          </Button>
        </Modal>
      )}
    </div>
  );
}
