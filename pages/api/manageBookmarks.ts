import type { NextApiRequest, NextApiResponse } from 'next';
import connectToUserDB from '../../database/userConn';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case 'POST':
      try {
        const { email, articleId } = req.body;
        console.log(email);
        console.log(articleId);
        if (!email || !articleId) {
          return res.status(400).json({ error: 'Missing email or articleId' });
        }

        const db = await connectToUserDB();
        const user = await db
          .collection('users')
          .findOneAndUpdate(
            { email },
            { $addToSet: { bookmarks: articleId } },
            { returnDocument: 'after', upsert: true }
          );
        console.log('bookmarked article', email);
        return res.status(200).json(user);
      } catch (err) {
        return res.status(500).json({ error: 'Unable to bookmark article' });
      }
    case 'DELETE':
      try {
        const { email, articleId } = req.body;
        if (!email || !articleId) {
          return res.status(400).json({ error: 'Missing email or articleId' });
        }

        const db = await connectToUserDB();
        const user = await db.collection('users').findOneAndUpdate(
          { email },
          { $pull: { bookmarks: articleId } }, // Use $pull to remove item from array
          { returnDocument: 'after' }
        );
        console.log('removed bookmark', email);
        return res.status(200).json(user);
      } catch (err) {
        return res.status(500).json({ error: 'Unable to remove bookmark' });
      }
      case 'GET':
        try {
          const { email, articleId } = req.query;
          if (!email || !articleId) {
            return res.status(400).json({ error: 'Missing email or articleId' });
          }
  
          const db = await connectToUserDB();
          const user = await db.collection('users').findOne({ email });
          if (!user) {
            return res.status(404).json({ error: 'User not found' });
          }
  
          const isBookmarked = user.bookmarks.includes(articleId);
          return res.status(200).json({ isBookmarked });
        } catch (err) {
          return res.status(500).json({ error: 'Unable to fetch bookmark status' });
        }
    default:
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
