import connectToAuthDB from '../../../database/authConn';
import connectMongo from '../../../database/conn';
import Users from '../../../model/Schema';
import { hash } from 'bcryptjs';

export default async function handler(req: any, res: any) {
  try {
    await connectMongo();

    // Only post method is accepted
    if (req.method === 'POST') {
      if (!req.body) {
        return res.status(404).json({ error: 'No form data' });
      }
      const { name, email, password } = req.body;

      // Check duplicate users
      const checkExisting = await Users.findOne({ email });
      if (checkExisting) {
        return res.status(422).json({ message: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await hash(password, 12);
      const user = new Users({ name, email, password: hashedPassword });
      await user.save();

      return res.status(201).json({ status: true, user });
    } else {
      return res.status(500).json({ message: 'HTTP method not valid, only POST accepted' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
