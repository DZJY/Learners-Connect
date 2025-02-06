import { MongoClient, Db, GridFSBucket, ObjectId } from 'mongodb';
import type { NextApiRequest, NextApiResponse } from 'next';
import connectToAuthDB from '../../../database/authConn';

export default async function handler(req:any, res:NextApiResponse) {

  if (req.method === 'GET') {
    try {
      const db = await connectToAuthDB();
      const bucket = new GridFSBucket(db);
      const file_id = new ObjectId(req.query.id);

      // Check if file exists
      const file = await db.collection('fs.files').findOne({ _id: file_id });

      if (!file) {
        return res.status(404).send({ err: 'No file exists' });
      }

      // If file exists, create download stream
      const downloadStream = bucket.openDownloadStream(file_id);

      // Set headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${file.filename}`);
      
      // Pipe the stream
      downloadStream.pipe(res);

    } catch (error) {
      console.error(error); // Log the error for debugging
      res.status(500).send({ error: 'Error connecting to the database' });
    }
  } else {
    res.status(405).send({ error: 'Method not allowed' });
  }
}
