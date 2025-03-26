/* eslint-disable @typescript-eslint/no-shadow */
import type { NextApiRequest, NextApiResponse } from 'next'; // Types for Next.js API route handler
import connectMongo from '../../../database/conn'; // Function to connect to MongoDB (likely using Mongoose)
import { Users } from '../../../model/Schema'; // Mongoose User model

// API handler to manage user points (fetch, add, deduct)
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Establish MongoDB connection
  await connectMongo();

  // Log the incoming request (for debugging purposes)
  console.log(req);

  try {
    const { email } = req.query;

    // Handle GET request: Fetch user's current points
    if (req.method === 'GET') {
      const user = await Users.findOne({ email }); // Look up user by email

      if (!user) {
        return res.status(404).json({ error: 'User not found' }); // Return 404 if user doesn't exist
      }

      return res.status(200).json({ points: user.points }); // Return user's points
    }

    // Handle POST request: Add points to user
    if (req.method === 'POST') {
      const { email, amount } = req.body; // Extract email and amount to add from request body
      const user = await Users.findOne({ email }); // Find user by email
      const currentPoints = user.points; // Store current points for response

      const updatedUser = await Users.findOneAndUpdate(
        { email }, // Filter by email
        { $inc: { points: amount } }, // Increment points by amount
        { new: true } // Return updated user document
      );

      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Return response with before and after points
      return res.status(200).json({
        message: 'Points updated',
        PreviousPoints: currentPoints,
        PointsAdded: amount,
        Updatedpoints: updatedUser.points,
      });
    }

    // Handle PUT request: Deduct points from user
    if (req.method === 'PUT') {
      const { email, amount } = req.body; // Extract email and amount to deduct
      const user = await Users.findOne({ email }); // Find user by email
      const currentPoints = user.points; // Store current points for response

      const updatedUser = await Users.findOneAndUpdate(
        { email }, // Filter by email
        { $inc: { points: -amount } }, // Deduct points (negative increment)
        { new: true } // Return updated user document
      );

      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Return response with before and after points
      return res.status(200).json({
        message: 'Points deducted',
        PreviousPoints: currentPoints,
        PointsDeducted: amount,
        Updatedpoints: updatedUser.points,
      });
    }

    // If method is not GET, POST, or PUT, return method not allowed
    return res.status(405).json({ error: 'Method not allowed' });

    // Note: A future "buy" function could be added here
  } catch (error) {
    // Handle unexpected errors
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
