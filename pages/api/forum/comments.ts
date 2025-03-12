import { NextApiRequest, NextApiResponse } from 'next';
import connectMongo from '../../../database/conn';
import { ForumPost, Users } from '../../../model/Schema';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectMongo();

  if (req.method === 'POST') {  
    try {
      const { postId, email, text, name } = req.body; // ✅ Extract `name`
      
      if (!postId || !email || !text || !name) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // ✅ Find the user by email
      const user = await Users.findOne({ email });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // ✅ Add the comment
      const post = await ForumPost.findByIdAndUpdate(
        postId,
        {
          $push: {
            comments: {
              commenterId: user._id, // ✅ Store the User ID
              name, // ✅ Store the commenter's name
              text,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          },
        },
        { new: true }
      ).populate('comments.commenterId', 'name email'); // ✅ Populate commenter details

      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      return res.status(201).json({ message: 'Comment added successfully', post });
    } catch (error) {
      console.error('❌ Error adding comment:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' }); 
}
