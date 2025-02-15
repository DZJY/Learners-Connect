import { NextApiRequest, NextApiResponse } from 'next';
import connectMongo from '../../../database/conn';
import { ForumPost } from '../../../model/Schema';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectMongo();

  if (req.method === 'GET') {
    try {
      const { id } = req.query;
      const post = await ForumPost.findById(id).populate('ownerId', 'name email');
      if (!post) return res.status(404).json({ error: 'Post not found' });

      return res.status(200).json(post);
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      const post = await ForumPost.findByIdAndDelete(id);
      if (!post) return res.status(404).json({ error: 'Post not found' });

      return res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
