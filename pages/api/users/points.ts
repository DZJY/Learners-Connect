import type { NextApiRequest, NextApiResponse } from 'next';
import connectMongo from '../../../database/conn';
import { Users } from '../../../model/Schema';
import { userAgent } from 'next/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectMongo();
  console.log(req);
  
  try {
    const { email } = req.query;
    if (req.method === 'GET') {
      // Fetch user's points

      const user = await Users.findOne({ email });
      console.log("EMAIL", email);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.status(200).json({ points: user.points });
    } else if (req.method === 'POST') {
      const { email, amount } = req.body;
      const user = await Users.findOne({ email });
      const currentPoints = user.points;
      // Add points to user
      const updatedUser = await Users.findOneAndUpdate(
        { email },
        { $inc: { points: amount } },
        { new: true } // Return updated user
      );

      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.status(200).json({ message: 'Points updated', PreviousPoints: currentPoints, PointsAdded: amount, Updatedpoints: updatedUser.points });
    } else if (req.method === 'PUT') {
        const { email, amount } = req.body;
        const user = await Users.findOne({ email });
        const currentPoints = user.points;
      // Deduct points from user
      const updatedUser = await Users.findOneAndUpdate(
        { email },
        { $inc: { points: -amount } },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.status(200).json({ message: 'Points deducted', PreviousPoints: currentPoints, PointsDeducted: amount, Updatedpoints: updatedUser.points });
    }
      return res.status(405).json({ error: 'Method not allowed' });

      // add buy function

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
