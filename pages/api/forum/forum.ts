import { NextApiRequest, NextApiResponse } from 'next';
import connectMongo from '../../../database/conn';
import { ForumPost, Users } from '../../../model/Schema';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectMongo();

  if (req.method === 'POST') {
    try {
      const { title, content, email } = req.body;

      if (!title || !content || !email) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // ✅ Find user by email
      const user = await Users.findOne({ email });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // ✅ Create new post
      const newPost = new ForumPost({
        title,
        content,
        ownerId: user._id, // ✅ Store the user ID
        comments: [],
      });

      await newPost.save();

      // ✅ Populate `ownerId` before returning
      const populatedPost = await ForumPost.findById(newPost._id)
        .populate('ownerId', 'name email');

      return res.status(201).json({ post: populatedPost });
    } catch (error) {
      console.error('❌ Error creating post:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  if (req.method === 'GET') {
    try {
      // ✅ Fetch posts with full owner & comment details
      const posts = await ForumPost.find()
        .populate('ownerId', 'name email') // ✅ Populate post owner
        .populate('comments.commenterId', 'name email'); // ✅ Populate comment authors

      return res.status(200).json(posts);
    } catch (error) {
      console.error('❌ Error fetching posts:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
