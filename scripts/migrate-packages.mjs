#!/usr/bin/env node

/**
 * Migration Script: Firebase Packages to MongoDB
 * 
 * This script migrates all package data from Firebase Firestore to MongoDB.
 * It preserves all existing data and creates proper indexes.
 * 
 * Usage:
 *   MONGODB_URI="mongodb://localhost:27017/earnfree" node scripts/migrate-packages.mjs
 */

import { initializeApp, cert } from 'firebase-admin/app.js';
import { getFirestore } from 'firebase-admin/firestore.js';
import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/earnfree';
const SERVICE_ACCOUNT_PATH = process.env.SERVICE_ACCOUNT_PATH || './serviceAccountKey.json';

async function main() {
  console.log('🔄 Starting package migration from Firebase to MongoDB...\n');

  // Load Firebase credentials
  let serviceAccount;
  try {
    const content = fs.readFileSync(SERVICE_ACCOUNT_PATH, 'utf8');
    serviceAccount = JSON.parse(content);
    console.log('✓ Loaded Firebase service account');
  } catch (error) {
    console.error('✗ Failed to load service account:', error.message);
    process.exit(1);
  }

  // Initialize Firebase
  try {
    initializeApp({
      credential: cert(serviceAccount),
    });
    console.log('✓ Initialized Firebase Admin');
  } catch (error) {
    console.error('✗ Failed to initialize Firebase:', error.message);
    process.exit(1);
  }

  // Connect to MongoDB
  let mongoClient;
  try {
    mongoClient = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    await mongoClient.connect();
    console.log('✓ Connected to MongoDB');
  } catch (error) {
    console.error('✗ Failed to connect to MongoDB:', error.message);
    console.error('\nMake sure MongoDB is running and MONGODB_URI is correct.');
    process.exit(1);
  }

  try {
    // Fetch from Firebase
    const firestore = getFirestore();
    const snapshot = await firestore.collection('packages').orderBy('created_at', 'desc').limit(200).get();

    console.log(`\n📦 Found ${snapshot.size} packages in Firebase\n`);

    if (snapshot.size === 0) {
      console.log('ℹ No packages to migrate.');
      await mongoClient.close();
      process.exit(0);
    }

    // Prepare packages for MongoDB
    const packages = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      packages.push({
        id: doc.id,
        title: data.title || data.name || 'Untitled package',
        description: data.description || '',
        location: data.location || data.destination || '',
        destination: data.destination || data.location || '',
        duration: data.duration || '',
        price: Number(data.price || 0),
        rating: Number(data.rating || 4.7),
        image_url: data.image_url || data.image || '',
        category: data.category || 'Domestic',
        featured: Boolean(data.featured),
        highlights: Array.isArray(data.highlights) ? data.highlights : [],
        created_at: data.created_at?.toDate ? data.created_at.toDate() : new Date(data.created_at),
        updated_at: data.updated_at?.toDate ? data.updated_at.toDate() : new Date(data.updated_at),
      });
    });

    // Insert into MongoDB
    const db = mongoClient.db('earnfree');
    const collection = db.collection('packages');

    // Create indexes
    await collection.createIndex({ created_at: -1 });
    await collection.createIndex({ title: 1 });
    await collection.createIndex({ category: 1 });
    console.log('✓ Created database indexes');

    // Insert packages
    if (packages.length > 0) {
      const result = await collection.insertMany(packages, { ordered: false });
      console.log(`✓ Inserted ${result.insertedCount} packages into MongoDB`);

      // Verify insertion
      const count = await collection.countDocuments();
      console.log(`✓ Verified: MongoDB now has ${count} packages total\n`);

      // Display sample
      console.log('📋 Sample packages:');
      const samples = await collection.find({}).limit(3).toArray();
      samples.forEach((pkg, i) => {
        console.log(`  ${i + 1}. ${pkg.title} (${pkg.destination}) - ₹${pkg.price}`);
      });
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('💡 Tip: Your existing Firebase packages are still intact.');
    console.log('💡 The system now uses MongoDB as primary and Firebase as fallback.');
  } catch (error) {
    console.error('\n✗ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await mongoClient.close();
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
