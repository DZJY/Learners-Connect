import type { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient, Db, GridFSBucket } from 'mongodb';
import connectToAuthDB from '../../database/authConn';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const db = await connectToAuthDB();
      const bucket = new GridFSBucket(db);

      // Create an array to store the file data
      let filesData: any = [];

      // Create a stream and use it to read filenames from GridFS
      const stream = bucket.find({}).sort({ _id: -1 }).stream();

      stream.on('data', (doc) => {
        // Push each file data to the array
        filesData.push({
          filename: doc.filename,
          length: doc.length,
          userName: doc.metadata.userName,
          title: doc.metadata.title,
          _id: doc._id.toString(),
        });
      });

      stream.on('error', (error) => {
        res.status(500).json({ error: 'Error reading files' });
      });

      stream.on('end', () => {
        // When the stream is finished, return the files data
        res.json(filesData);
      });
    } catch (error) {
      res.status(500).json({ error: 'Error connecting to the database' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
