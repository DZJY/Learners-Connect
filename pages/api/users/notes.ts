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
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  await connectMongo();

  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    await client.connect();
    const db = client.db('Auth'); // Use the correct database name
    const filesCollection = db.collection('fs.files');

    // Fetch user's uploaded notes
    const uploadedNotes = await filesCollection
      .find({ 'metadata.userEmail.0': email }) // GridFS stores metadata.userEmail as an array
      .toArray();

    // Fetch user's bought notes
    const user = await Users.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const ownedNoteIds = user.NotesOwned?.map((id: string) => new ObjectId(id)) || [];

    const boughtNotes = ownedNoteIds.length
      ? await filesCollection.find({ _id: { $in: ownedNoteIds } }).toArray()
      : [];

    return res.status(200).json({ uploadedNotes, boughtNotes });
  } catch (error) {
    console.error('❌ Error fetching user notes:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
