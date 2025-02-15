import type { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient, ObjectId } from 'mongodb';
import connectMongo from '../../../database/conn';
import Users from '../../../model/Schema';

const { MONGO_URI } = process.env;

// Ensure MONGO_URI is defined
if (!MONGO_URI) {
  throw new Error('❌ Missing MONGO_URI environment variable. Set it in .env file.');
}
const client = new MongoClient(MONGO_URI);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectMongo();

  try {
    if (req.method !== 'PATCH') {
      return res.status(405).json({ error: 'Method not allowed. Use PATCH for buying notes.' });
    }

    const { buyerEmail, sellerEmail, noteId, amount } = req.query;

    if (!buyerEmail || !sellerEmail || !noteId || amount === undefined) {
      return res.status(400).json({ error: 'Buyer, seller, noteId, and amount are required as query parameters.' });
    }

    const parsedAmount = Number(amount);
    if (Number.isNaN(parsedAmount)) {
      return res.status(400).json({ error: 'Amount must be a valid number.' });
    }

    // Connect to MongoDB and access GridFS
    await client.connect();
    const db = client.db('Auth'); // ✅ Ensure you're using the correct database
    const filesCollection = db.collection('fs.files');

    // Check if the note exists in GridFS
    const note = await filesCollection.findOne({ _id: new ObjectId(noteId as string) });
    if (!note) {
      return res.status(404).json({ error: 'Note not found.' });
    }

    // Ensure seller is correct
    if (note.metadata?.userEmail[0] !== sellerEmail) {
      return res.status(400).json({ error: 'Seller does not own this note.' });
    }

    // Fetch buyer and seller
    const buyer = await Users.findOne({ email: buyerEmail });
    if (!buyer) return res.status(404).json({ error: 'Buyer not found.' });

    if (buyer.points < parsedAmount) {
      return res.status(400).json({ error: 'Buyer does not have enough points.' });
    }

    const seller = await Users.findOne({ email: sellerEmail });
    if (!seller) return res.status(404).json({ error: 'Seller not found.' });

    // Ensure buyer hasn't already purchased this note
    if (buyer.NotesOwned && buyer.NotesOwned.includes(noteId as string)) {
      return res.status(400).json({ error: 'Buyer already owns this note.' });
    }

    // Perform the transaction
    await Users.updateOne(
      { email: buyerEmail },
      {
        $inc: { points: -parsedAmount },
        $addToSet: { NotesOwned: noteId as string }, // ✅ Store note ID in the buyer's NotesOwned array
      }
    );

    await Users.updateOne(
      { email: sellerEmail },
      { $inc: { points: parsedAmount } }
    );

    return res.status(200).json({
      message: 'Transaction successful',
      noteTitle: note.filename,
      buyerPoints: buyer.points - parsedAmount,
      sellerPoints: seller.points + parsedAmount,
    });
  } catch (error) {
    console.error('❌ Error in buy transaction:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
