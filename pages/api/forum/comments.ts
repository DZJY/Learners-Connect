import { NextApiRequest, NextApiResponse } from 'next';
import connectMongo from '../../../database/conn';
import { ForumPost } from '../../../model/Schema';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectMongo();

  if (req.method === 'POST') {
    // Add a comment to a forum post
    try {
      const { postId, commenterId, text } = req.body;

      if (!postId || !commenterId || !text) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const post = await ForumPost.findByIdAndUpdate(
        postId,
        {
          $push: { comments: { commenterId, text, timestamp: new Date() } }
        },
        { new: true }
      ).populate('comments.commenterId', 'name email'); // Populate user info

      if (!post) return res.status(404).json({ error: 'Post not found' });

      return res.status(200).json({ message: 'Comment added successfully', post });
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { postId, commentId } = req.query;

      if (!postId || !commentId) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const post = await ForumPost.findById(postId);
      if (!post) return res.status(404).json({ error: 'Post not found' });

      // Filter out the comment
      const updatedComments = post.comments.filter(comment => comment._id.toString() !== commentId);

      // If no comment was removed, return not found
      if (updatedComments.length === post.comments.length) {
        return res.status(404).json({ error: 'Comment not found' });
      }

      // Update post comments and save
      post.comments = updatedComments;
      await post.save();

      return res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error) {
      console.error('❌ Error deleting comment:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
