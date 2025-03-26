import type { NextApiRequest, NextApiResponse } from 'next'; // Next.js types for API routes
import { MongoClient, ObjectId } from 'mongodb'; // MongoDB client and ObjectId utility
import connectMongo from '../../../database/conn'; // Function to connect to MongoDB (likely using Mongoose)
import { Users } from '../../../model/Schema'; // Mongoose User model

const { MONGO_URI } = process.env;

// Ensure MONGO_URI is defined
if (!MONGO_URI) {
  throw new Error('❌ Missing MONGO_URI environment variable. Set it in .env file.');
}

// Create a new MongoDB client instance
const client = new MongoClient(MONGO_URI);

// API handler to process note purchase transactions
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectMongo(); // Ensure Mongoose is connected to MongoDB

  try {
    // Only allow PATCH requests for buying notes
    if (req.method !== 'PATCH') {
      return res.status(405).json({ error: 'Method not allowed. Use PATCH for buying notes.' });
    }

    // Extract required query parameters
    const { buyerEmail, sellerEmail, noteId, amount } = req.query;

    // Validate presence of all required parameters
    if (!buyerEmail || !sellerEmail || !noteId || amount === undefined) {
      return res.status(400).json({ error: 'Buyer, seller, noteId, and amount are required as query parameters.' });
    }

    // Convert amount to number
    const parsedAmount = Number(amount);
    if (Number.isNaN(parsedAmount)) {
      return res.status(400).json({ error: 'Amount must be a valid number.' });
    }

    // Connect to MongoDB client (for GridFS usage)
    await client.connect();
    const db = client.db('Auth'); // Use 'Auth' database
    const filesCollection = db.collection('fs.files'); // Access GridFS files collection

    // Find the note by its ObjectId
    const note = await filesCollection.findOne({ _id: new ObjectId(noteId as string) });
    if (!note) {
      return res.status(404).json({ error: 'Note not found.' });
    }

    // Ensure the seller actually owns the note
    if (note.metadata?.userEmail[0] !== sellerEmail) {
      return res.status(400).json({ error: 'Seller does not own this note.' });
    }

    console.log(sellerEmail); // Debug log: seller's email

    // Fetch buyer and validate existence
    const buyer = await Users.findOne({ email: buyerEmail });
    console.log(buyer); // Debug log: buyer object
    if (!buyer) return res.status(404).json({ error: 'Buyer not found.' });

    // Ensure buyer has enough points to make the purchase
    if (buyer.points < parsedAmount) {
      return res.status(400).json({ error: 'Buyer does not have enough points.' });
    }

    // Fetch seller and validate existence
    const seller = await Users.findOne({ email: sellerEmail });
    if (!seller) return res.status(404).json({ error: 'Seller not found.' });

    // Ensure the buyer has not already purchased this note
    if (buyer.NotesOwned && buyer.NotesOwned.includes(noteId as string)) {
      return res.status(400).json({ error: 'Buyer already owns this note.' });
    }

    // --- Perform the transaction ---

    // Deduct points from buyer and add the note to NotesOwned
    await Users.updateOne(
      { email: buyerEmail },
      {
        $inc: { points: -parsedAmount }, // Subtract points
        $addToSet: { NotesOwned: noteId as string }, // Add note to owned list (prevent duplicates)
      }
    );

    // Add points to seller
    await Users.updateOne(
      { email: sellerEmail },
      { $inc: { points: parsedAmount } }
    );

    // Return successful response with updated point info
    return res.status(200).json({
      message: 'Transaction successful',
      noteTitle: note.filename,
      buyerPoints: buyer.points - parsedAmount,
      sellerPoints: seller.points + parsedAmount,
    });
  } catch (error) {
    // Log and handle unexpected errors
    console.error('❌ Error in buy transaction:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
