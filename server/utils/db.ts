import { MongoClient, Db, Collection } from 'mongodb';

let mongoClient: MongoClient | null = null;
let db: Db | null = null;

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/earnfree';
const DB_NAME = 'earnfree';

export interface Package {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  location: string;
  destination: string;
  duration: string;
  price: number;
  rating: number;
  image_url: string;
  category: 'Domestic' | 'International' | 'Group' | 'Honeymoon' | 'Adventure';
  featured: boolean;
  highlights: string[];
  created_at: Date;
  updated_at: Date;
}

export async function connectDB(): Promise<Db> {
  if (db) {
    return db;
  }

  try {
    mongoClient = new MongoClient(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    });

    await mongoClient.connect();
    db = mongoClient.db(DB_NAME);

    // Create collections and indexes if they don't exist
    const collections = await db.listCollections({ name: 'packages' }).toArray();
    if (collections.length === 0) {
      await db.createCollection('packages');
    }

    const packagesCollection = db.collection('packages');
    await packagesCollection.createIndex({ created_at: -1 });
    await packagesCollection.createIndex({ title: 1 });
    await packagesCollection.createIndex({ category: 1 });

    console.log('✓ Connected to MongoDB');
    return db;
  } catch (error) {
    console.error('✗ Failed to connect to MongoDB:', error);
    throw error;
  }
}

export function getDB(): Db {
  if (!db) {
    throw new Error('Database not initialized. Call connectDB() first.');
  }
  return db;
}

export async function getPackagesCollection(): Promise<Collection<Package>> {
  const database = getDB();
  return database.collection('packages');
}

export async function closeDB(): Promise<void> {
  if (mongoClient) {
    await mongoClient.close();
    mongoClient = null;
    db = null;
  }
}
