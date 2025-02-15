import { NextApiRequest, NextApiResponse } from 'next';
import connectMongo from '../../../database/conn';
import { ForumPost, Users } from '../../../model/Schema';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectMongo();

  if (req.method === 'POST') {
    try {
      const { title, content, email } = req.body;
      if (!title || !content || !email) return res.status(400).json({ error: 'Missing required fields' });

      const user = await Users.findOne({ email });
      console.log(user);
      if (!user) return res.status(404).json({ error: 'User not found' });

      const newPost = new ForumPost({ title, content, ownerId: user._id });
      await newPost.save();
      console.log(newPost);
      await Users.findByIdAndUpdate(user._id, { $push: { forumPosts: newPost._id } });

      return res.status(200).json({ message: 'Post created successfully', post: newPost });
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  if (req.method === 'GET') {
    try {
      const posts = await ForumPost.find().populate('ownerId', 'name email').sort({ createdAt: -1 });
      return res.status(200).json(posts);
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
