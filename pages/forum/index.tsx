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
  Divider,
} from '@mantine/core';
import { IconSend, IconMessageCircle, IconBookmark, IconShare } from '@tabler/icons-react';


type Post = {
  _id: string;
  title: string;
  content: string;
  ownerId: { name: string; email: string };
  ownerName?: string;
  comments: { _id: string; name: string; text: string; timestamp: string }[];
  createdAt: string;
  updatedAt: string;
};

const useStyles = createStyles((theme) => ({
  container: {
    width: '100%',
    maxWidth: '80%', // Ensure the content does not stretch too wide
    paddingLeft: '10%', // Adds 10% padding on both sides (20% total)
    paddingRight: '10%',
    margin: '0 auto', // Centers the container
  },
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
    minHeight: '5vh',
  },
  input: {
    padding: '16px !important',
    width: '100% !important',
  },
  postCard: {
    cursor: 'pointer',
    transition: 'box-shadow 0.3s ease',
    '&:hover': {
      boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
    },
  },
  modalContainer: {
    width: '100%', // Ensures it can expand fully if needed
    maxWidth: '48rem', // Limits max width to 768px (3xl)
    minWidth: '50vw', // ✅ Minimum width set to 50% of viewport width
    minHeight: '50vh', // ✅ Minimum height set to 50% of viewport height
  },
  postButtonContainer: {
    display: 'flex',
    justifyContent: 'flex-end', // ✅ Moves button to the right
    marginTop: '1rem',
    paddingRight: '16px',
    paddingLeft: '16px',
  },
  postsContainer: {
    width: '100%',
    marginTop: '1.5rem', // mt-6 (24px)
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem', // space-y-4 (16px)
  },
  postsHeader: {
    fontSize: '2rem', // ✅ Adjust font size (e.g., 2rem = 32px)
    fontWeight: 700, // ✅ Adjust boldness (400 = normal, 700 = bold, 900 = extra bold)
    color: '#fff', // ✅ White text (adjust as needed)
    marginTop: '8px',
    marginBottom: '8px',
  },
  postsBodyCard: {
    fontSize: '1rem', // ✅ Adjust font size (e.g., 2rem = 32px)
    fontWeight: 400, // ✅ Adjust boldness (400 = normal, 700 = bold, 900 = extra bold)
    color: '#fff', // ✅ White text (adjust as needed)
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: 5, // ✅ Truncates text after 5 lines
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  postsBody: {
    fontSize: '1rem', // ✅ Adjust font size (e.g., 2rem = 32px)
    fontWeight: 400, // ✅ Adjust boldness (400 = normal, 700 = bold, 900 = extra bold)
    color: '#fff', // ✅ White text (adjust as needed)
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
  const [selectedPostOwner, setSelectedPostOwner] = useState<{ name: string; email: string } | null>(null);

  // ✅ Get logged-in user's email and name
  const userEmail = session?.user?.email;
  const userName = session?.user?.name;

  useEffect(() => {
    if (selectedPost) {
      document.body.style.overflow = 'hidden'; // ✅ Disables background scroll
    } else {
      document.body.style.overflow = 'auto'; // ✅ Restores scrolling when modal closes
    }
  }, [selectedPost]);

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

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/forum');
      const data: Post[] = await response.json();

      if (!Array.isArray(data)) {
        throw new Error('Invalid response format');
      }

      console.log('✅ Fetched Posts:', data); // Debugging

      // ✅ Ensure `ownerId` and `commenterId` are always populated
      setPosts(data);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to fetch posts. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Handle new post submission
  const handlePostSubmit = async () => {
    if (postTitle.trim() && postContent.trim()) {
      console.log(userName);
      try {
        const payload = {
          title: postTitle,
          content: postContent,
          email: userEmail, // ✅ Use logged-in user's email
          name: userName, // ✅ Use logged-in user's name
          // email: 'test12@gmail.com',
          // name: 'test12',
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
        setPosts((prevPosts) => {
          const updatedPosts = [data.post, ...prevPosts];
          console.log('✅ Updated Posts in State:', updatedPosts); // ✅ Logs latest state correctly
          return updatedPosts;
        });
        fetchPosts();
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
        if (!session?.user?.email || !session.user.name) {
          throw new Error('User email or name is missing in session.');
        }

        const payload = {
          postId,
          email: session.user.email, // Send email
          name: session.user.name, // Send name
          text: comment,
        };

        console.log('📤 Sending Comment Payload:', payload); // Debugging

        const response = await fetch('/api/forum/comments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        console.log('Response Status:', response.status); // Debugging

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Request failed: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('✅ Received Comment Response:', data); // Debugging

        // Log the updated post comments
        console.log('✅ Updated Post Comments:', data.post.comments);

        setSelectedPost((prevPost) => 
          prevPost 
            ? { ...data.post, ownerName: selectedPostOwner } // ✅ Preserve ownerName
            : data.post
        );
        setCommentInputs({ ...commentInputs, [postId]: '' });

        // ✅ Re-fetch posts to ensure updated comments
        fetchPosts();
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
    <div className={`w-full flex justify-center`}>
      <div className={classes.container}>
        <h1 className={classes.header}>Forum</h1>

        {/* New Post Section */}
        <div className="w-full">
          <h2 className="text-lg font-semibold mb-2">Post your own discussion</h2>
          <Card shadow="sm" p="lg" withBorder className="w-full !bg-white rounded-lg shadow-md p-4">
            <Input
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
              placeholder="Enter discussion title..."
              className={`w-full mb-3 ${classes.input}`}
            />
            <Textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="Write your discussion content..."
              autosize
              minRows={2}
              className={`w-full mb-3 ${classes.input}`}
            />
            <div className={classes.postButtonContainer}>
              <Button
                leftIcon={<IconSend size={16} />}
                onClick={handlePostSubmit}
                disabled={!session}
                className="bg-blue-500 text-white hover:bg-blue-600"
              >
                Post
              </Button>
            </div>
          </Card>
        </div>

        {/* Posts Section */}
        <div className={classes.postsContainer}>
          {posts.map((post) => (
            <Card
              key={post._id}
              shadow="sm"
              p="lg"
              withBorder
              className={classes.postCard}
              onClick={() => {setSelectedPost(post);
                setSelectedPostOwner(post.ownerId);
              }}
            >
              <Text className={classes.postsHeader}>{post.title}</Text>
              <Divider my="md" />
              <Text className={classes.postsBodyCard}>{post.content}</Text>
              <Divider my="md" />
              <Group position="apart" mt="md" color="gray.5">
                <Group>
                  <Text size="sm">Posted by: {post.ownerId?.name}</Text>
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
            title={selectedPost?.title}
            styles={{
              title: {
                fontSize: '2rem',
                fontWeight: 700,
                width: '100%',
              },
              inner: { display: 'flex', justifyContent: 'center', alignItems: 'center' },
              content: {
                width: '100%',
                maxWidth: '48rem',
                minWidth: '50vw',
                minHeight: '50vh',
                maxHeight: '90vh',
                padding: '1.5rem',
              },
            }}
          >
            <Text className={classes.postsBody}>{selectedPost?.content}</Text>
            <Divider my="md" />
            <Text size="sm" color="dimmed" mb="md">
              Posted by: <strong>{selectedPostOwner?.name}</strong>
            </Text>
            <div className="space-y-4">
              {selectedPost?.comments.map((comment) => (
                <div key={comment._id} className="border border-gray-700 p-3 rounded-lg">
                  <Text size="sm" weight={500}>
                    {comment.name || 'Anonymous'}: {/* ✅ Use the `name` field directly */}
                  </Text>
                  <Text size="sm" color="gray.6">
                    {comment.text}
                  </Text>
                </div>
              ))}
            </div>
            <Divider my="md" />
            <div className="flex flex-col space-y-2">
              <Input
                value={commentInputs[selectedPost._id] || ''}
                onChange={(e) =>
                  setCommentInputs({ ...commentInputs, [selectedPost._id]: e.target.value })
                }
                placeholder="Write a comment..."
                className="w-full"
              />
              <div className={classes.postButtonContainer}>
                <Button
                  size="sm"
                  onClick={() => handleCommentSubmit(selectedPost._id)}
                  className="mt-2"
                >
                  Comment
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
}
