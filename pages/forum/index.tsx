import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Card, Textarea, Button, Input, Text, Modal, Avatar, 
  Group, ActionIcon, LoadingOverlay, createStyles, Center 
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
  const { data: session } = useSession(); // ✅ Get logged-in user data
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // ✅ Extract user email and name
  const userEmail = session?.user?.email ?? '';
  const userName = session?.user?.name ?? 'Anonymous';

  // ✅ Fetch posts from the API and filter out undefined values
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/forum');
        const data = await response.json();

        // ✅ Ensure response is an array and remove invalid posts
        if (!Array.isArray(data)) {
          throw new Error('Invalid response format');
        }
        setPosts(data.filter(post => post && post.title)); // ✅ Remove undefined or invalid posts
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError('Failed to fetch posts. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // ✅ Handle new post submission with logged-in user's name & email
  const handlePostSubmit = async () => {
    if (newPost.trim()) {
      try {
        const payload = {
          title: newPost,
          content: newPost,
          //email: userEmail, // ✅ Use logged-in user's email
          //name: userName,   // ✅ Use logged-in user's name
          email: "test11@gmail.com",
          name: "test11",
        };
  
        console.log("Sending Request:", payload); // ✅ Log request payload before sending
  
        const response = await fetch('/api/forum', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
  
        console.log("Response Status:", response.status); // ✅ Log response status
  
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Request failed: ${response.status} - ${errorText}`);
        }
  
        const data = await response.json();
        console.log("Received Response:", data); // ✅ Log response data
  
        setPosts([...posts, data.post]);
        setNewPost('');
      } catch (err) {
        console.error('Error creating post:', err);
        setError('Failed to create post. Please try again.');
      }
    }
  };
  

  // ✅ Handle comment submission using user's email
  const handleCommentSubmit = async (postId: string) => {
    const comment = commentInputs[postId];
    if (comment?.trim()) {
      try {
        const response = await fetch('/api/forum/comments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            postId,
            commenterId: userName, // ✅ Use logged-in user's email
            text: comment,
          }),
        });

        const data = await response.json();
        setSelectedPost(data.post);
        setCommentInputs({ ...commentInputs, [postId]: '' });
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
        <Text size="sm" color="red">Please log in to post</Text>
      )}

      {/* New Post */}
      <Card shadow="sm" p="lg" withBorder className={classes.postCard}>
        <Textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="Start a discussion..."
          autosize
          minRows={2}
        />
        <Button leftIcon={<IconSend size={16} />} onClick={handlePostSubmit} mt="md" disabled={!session}>
          Post
        </Button>
      </Card>

      {/* Posts */}
      <div className={classes.card}>
        {Array.isArray(posts) && posts.length > 0 ? (
          posts.map((post, index) => 
            post ? ( // ✅ Ensure `post` is defined
              <Card
                key={post._id ?? index} // Use index as a fallback key
                shadow="sm"
                p="lg"
                withBorder
                className={classes.postCard}
                onClick={() => setSelectedPost(post)}
              >
                <Text weight={600} size="lg" mt="md">
                  {post?.title ?? 'Untitled Post'}
                </Text>
                <Text size="sm" color="gray">
                  {post?.content ?? 'No content available'}
                </Text>
                <Group position="apart" mt="md">
                  <Group>
                    <Avatar size={30} src="https://picsum.photos/30" />
                    <Text size="sm">{post?.ownerId?.name || 'Anonymous'}</Text>
                    {/* <Text size="xs" color="gray">{post?.ownerId?.email || ''}</Text> */}
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
            ) : null
          )
        ) : (
          <Text>No posts available.</Text>
        )}
      </div>

      {/* Post Modal */}
      {selectedPost && (
        <Modal opened={Boolean(selectedPost)} onClose={() => setSelectedPost(null)} title={selectedPost.title} size="lg">
          <Text>{selectedPost.content}</Text>
          <Text size="sm" color="gray">
            Posted by: {selectedPost.ownerId?.name || 'Anonymous'} 
            {/* ({selectedPost.ownerId?.email || ''}) */}
          </Text>
        </Modal>
      )}
    </div>
  );
}
