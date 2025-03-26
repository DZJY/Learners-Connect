import type { NextApiRequest, NextApiResponse } from 'next'; // Types for API route handlers in Next.js
import { MongoClient, ObjectId } from 'mongodb'; // MongoDB client and ObjectId utility
import connectMongo from '../../../database/conn'; // Custom function to establish a MongoDB connection (likely using Mongoose)
import { Users } from '../../../model/Schema'; // Mongoose model representing the Users collection

const { MONGO_URI } = process.env;

// Ensure the MongoDB URI is provided in the environment variables
if (!MONGO_URI) {
  throw new Error('❌ Missing MONGO_URI environment variable. Set it in .env file.');
}

// Instantiate a new MongoDB client with the URI
const client = new MongoClient(MONGO_URI);

// Main API handler for the endpoint
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  // Ensure MongoDB is connected (for Mongoose)
  await connectMongo();

  try {
    const { email } = req.query;

    // Check if email is provided in the query params
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    await client.connect(); // Connect the MongoDB client
    const db = client.db('Auth'); // Select the "Auth" database
    const filesCollection = db.collection('fs.files'); // Access the GridFS files collection

    // --- Fetch Uploaded Notes ---
    // Find notes that were uploaded by the user based on email in metadata
    const uploadedNotesRaw = await filesCollection
      .find({ 'metadata.userEmail.0': email })
      .project({
        filename: 1, // Include filename
        length: 1, // Include file size
        'metadata.userName': 1, // Include uploader's name
        'metadata.title': 1, // Include note title
        _id: 1, // Include document ID
      })
      .toArray();

    // --- Fetch Bought Notes ---
    // Find the user document from the Users collection
    const user = await Users.findOne({ email });

    // If user is not found, return 404
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Convert user's owned note IDs from string to ObjectId
    const ownedNoteIds = user.NotesOwned?.map((id: string) => new ObjectId(id)) || [];

    // Fetch note documents corresponding to the ownedNoteIds
    const boughtNotesRaw = ownedNoteIds.length
      ? await filesCollection
          .find({ _id: { $in: ownedNoteIds } })
          .project({
            filename: 1,
            length: 1,
            'metadata.userName': 1,
            'metadata.title': 1,
            _id: 1,
          })
          .toArray()
      : [];

    // --- Format Notes Helper Function ---
    // Transforms raw note documents into a cleaner format
    const formatNotes = (notes: any[]) =>
      notes.map((note) => ({
        filename: note.filename,
        length: note.length,
        userName: note.metadata?.userName || [],
        title: note.metadata?.title || [],
        _id: note._id,
      }));

    // Format uploaded notes
    const uploadedNotes = formatNotes(uploadedNotesRaw);

    // Filter out notes that are both uploaded and bought (avoid duplication)
    const uploadedNoteIds = new Set(uploadedNotes.map(note => note._id.toString()));
    const filteredBoughtNotesRaw = boughtNotesRaw.filter(
      note => !uploadedNoteIds.has(note._id.toString())
    );

    // Format bought notes
    const boughtNotes = formatNotes(filteredBoughtNotesRaw);

    // Return both uploaded and bought notes
    return res.status(200).json({ uploadedNotes, boughtNotes });
  } catch (error) {
    // Handle any unexpected server error
    console.error('❌ Error fetching user notes:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
