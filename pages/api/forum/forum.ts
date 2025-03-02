import { NextApiRequest, NextApiResponse } from 'next';

// Temporary in-memory storage (Replace this with a database)
let posts: any[] = [];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { title, content, email, name } = req.body;

    if (!title || !content || !email || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newPost = {
      _id: new Date().toISOString(),
      title,
      content,
      ownerId: { name, email },
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    posts.push(newPost); // Add to temporary storage
    return res.status(201).json({ post: newPost });
  }

  if (req.method === 'GET') {
    return res.status(200).json(posts);
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
