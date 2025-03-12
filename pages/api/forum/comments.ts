import { NextApiRequest, NextApiResponse } from 'next';
import connectMongo from '../../../database/conn';
import { ForumPost, Users } from '../../../model/Schema';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectMongo();

  if (req.method === 'POST') {
    try {
      const { postId, email, text } = req.body;

      console.log("📥 Received Request Body:", { postId, email, text });  // ✅ Debugging

      if (!postId || !email || !text) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // ✅ Find the user by email
      const user = await Users.findOne({ email });
      if (!user) {
        console.error("❌ User not found with email:", email);
        return res.status(404).json({ error: 'User not found' });
      }

      console.log(user)

      // ✅ Add comment using `commenterId` (user ID)
      const post = await ForumPost.findByIdAndUpdate(
        postId,
        { 
          $push: { 
            comments: {
              commenterId: user._id, // ✅ Store user ID
              name: user.name,
              text,
              timestamp: new Date() 
            } 
          } 
        },
        { new: true }
      ).populate('comments.commenterId', 'name email'); // ✅ Ensure username is fetched

      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      return res.status(201).json({ message: 'Comment added successfully', post });
    } catch (error) {
      console.error('❌ Error adding comment:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  if (req.method === 'GET') {
    try {
      const { postId } = req.query;

      if (!postId) {
        return res.status(400).json({ error: 'Missing postId' });
      }

      // ✅ Fetch the post and ensure `commenterId` is populated with `name`
      const post = await ForumPost.findById(postId)
        .populate('comments.commenterId', 'name email'); // ✅ Populate commenter's name

      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      return res.status(200).json(post);
    } catch (error) {
      console.error('❌ Error fetching post:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
