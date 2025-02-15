import type { NextApiRequest, NextApiResponse } from 'next';
import connectMongo from '../../../database/conn';
import { Users } from '../../../model/Schema';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectMongo(); // Ensure MongoDB is connected

  const { email, friendEmail } = req.query;

  try {
    if (req.method === 'GET') {
      // Fetch user's friends list
      const user = await Users.findOne({ email });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      console.log(user);
      return res.status(200).json({ friends: user.friends });
    } if (req.method === 'POST') {
      // Add a friend
      const updatedUser = await Users.findOneAndUpdate(
        { email },
        { $addToSet: { friends: friendEmail } }, // Prevent duplicate friends
        { new: true }
      );
      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }
      console.log('Friend added!');
      return res.status(200).json({ message: 'Friend added', friends: updatedUser.friends });
    } if (req.method === 'DELETE') {
      // Remove a friend
      const updatedUser = await Users.findOneAndUpdate(
        { email },
        { $pull: { friends: friendEmail } }, // Remove specific friend
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }
      console.log('Friend deleted!');
      return res.status(200).json({ message: 'Friend removed', friends: updatedUser.friends });
    }
      return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
