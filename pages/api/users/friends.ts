import type { NextApiRequest, NextApiResponse } from 'next'; // Importing types for API request and response from Next.js
import connectMongo from '../../../database/conn'; // Function to establish a MongoDB connection
import { Users } from '../../../model/Schema'; // Mongoose model representing the Users collection

// API handler to manage a user's friends list (fetch, add, delete)
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectMongo(); // Ensure MongoDB is connected before proceeding

  const { email, friendEmail } = req.query; // Extract user email and friendEmail from query parameters

  try {
    // Handle GET request: Fetch the user's friends list
    if (req.method === 'GET') {
      const user = await Users.findOne({ email }); // Find the user by email

      if (!user) {
        return res.status(404).json({ error: 'User not found' }); // Return 404 if user doesn't exist
      }

      console.log(user); // Log the user object (for debugging)
      return res.status(200).json({ friends: user.friends }); // Return user's friends list
    }

    // Handle POST request: Add a friend to the user's list
    if (req.method === 'POST') {
      const updatedUser = await Users.findOneAndUpdate(
        { email }, // Match user by email
        { $addToSet: { friends: friendEmail } }, // Add friend only if not already in the array
        { new: true } // Return the updated document
      );

      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      console.log('Friend added!'); // Log confirmation
      return res.status(200).json({ message: 'Friend added', friends: updatedUser.friends });
    }

    // Handle DELETE request: Remove a friend from the user's list
    if (req.method === 'DELETE') {
      const updatedUser = await Users.findOneAndUpdate(
        { email }, // Match user by email
        { $pull: { friends: friendEmail } }, // Remove friend from the array
        { new: true } // Return the updated document
      );

      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      console.log('Friend deleted!'); // Log confirmation
      return res.status(200).json({ message: 'Friend removed', friends: updatedUser.friends });
    }

    // If method is not GET, POST, or DELETE, return method not allowed
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    // Handle unexpected errors
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
