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
      ownerId: { // ✅ Ensure `ownerId` is always stored as an object
        _id: new Date().getTime().toString(), // Simulate a user ID
        name,
        email,
      },
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    posts.push(newPost); // Add to temporary storage

    console.log("✅ New Post Created:", newPost); // Debugging log

    return res.status(201).json({ post: newPost });
  }

  if (req.method === 'GET') {
    // ✅ Ensure all `ownerId` fields are objects
    const formattedPosts = posts.map(post => ({
      ...post,
      ownerId: typeof post.ownerId === "string"
        ? { _id: post.ownerId, name: "Unknown", email: "unknown@example.com" } // Fallback for old entries
        : post.ownerId
    }));

    return res.status(200).json(formattedPosts);
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
