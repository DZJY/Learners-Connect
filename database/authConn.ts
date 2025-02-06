import { MongoClient, Db } from 'mongodb';

let client: MongoClient | null = null;
let db: Db | null = null;

export default async function connectToAuthDB(): Promise<Db> {
  if (db) {
    return db;
  }

  try {
    if(!client){
      client = new MongoClient(process.env.MONGO_URI!);
      await client.connect();
    }
    db = client.db('Auth');
    return db;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export function getUserDB(): Db {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
}

export async function closeUserDB(): Promise<void> {
  if (client) {
    await client.close();
  }
  db = null;
}