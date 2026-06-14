import { connectDB, getPackagesCollection, Package } from '~/server/utils/db';
import { ObjectId } from 'mongodb';
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import * as fs from 'fs';
import * as path from 'path';

// Initialize Firebase Admin (use service account if available)
let firebaseAdminApp: any = null;
let firebaseAuth: any = null;

function initFirebaseAdmin() {
  if (firebaseAdminApp) return;
  
  try {
    const serviceAccountPath = path.join(process.cwd(), 'serviceAccountKey.json');
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      firebaseAdminApp = initializeApp({
        credential: cert(serviceAccount),
      });
      firebaseAuth = getAuth(firebaseAdminApp);
    }
  } catch (error) {
    console.debug('Firebase Admin not available, using cookie auth fallback');
  }
}

async function verifyAdminAuth(event: any): Promise<boolean> {
  // Try Firebase token auth first
  try {
    const authHeader = getHeader(event, 'authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      initFirebaseAdmin();
      
      if (firebaseAuth) {
        const decodedToken = await firebaseAuth.verifyIdToken(token);
        
        // Check if user is admin
        const claims = decodedToken.custom_claims || {};
        return claims.admin === true || decodedToken.email?.endsWith('@earnfree.com');
      }
    }
  } catch (error) {
    console.debug('Firebase token verification failed:', error);
  }

  // Fallback to cookie auth
  const auth = getCookie(event, 'admin_auth');
  return !!auth;
}

export default defineEventHandler(async (event) => {
  const method = getMethod(event);

  try {
    // Ensure database connection
    await connectDB();

    if (method === 'GET') {
      return await handleGetPackages(event);
    } else if (method === 'POST') {
      return await handleCreatePackage(event);
    } else {
      throw createError({
        statusCode: 405,
        statusMessage: 'Method Not Allowed',
      });
    }
  } catch (error) {
    console.error('Package API Error:', error);
    if (error instanceof Error && error.message === 'Database not initialized') {
      // Fallback: return empty array if DB not available
      return [];
    }
    throw error;
  }
});

async function handleGetPackages(event: any) {
  const query = getQuery(event);
  const limit = parseInt(query.limit as string) || 50;
  const skip = parseInt(query.skip as string) || 0;
  const adminOnly = query.admin === 'true';

  try {
    const collection = await getPackagesCollection();

    const packages = await collection
      .find({})
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Transform MongoDB documents to match expected format
    const transformed = packages.map((pkg: any) => ({
      id: pkg._id?.toString() || pkg.id,
      title: pkg.title,
      description: pkg.description || '',
      image_url: pkg.image_url || pkg.image || '',
      price: pkg.price,
      location: pkg.location || pkg.destination || '',
      duration: pkg.duration,
      category: pkg.category,
      featured: pkg.featured || false,
      rating: pkg.rating || 4.7,
      highlights: pkg.highlights || [],
      created_at: pkg.created_at?.toISOString() || new Date().toISOString(),
      updated_at: pkg.updated_at?.toISOString() || new Date().toISOString(),
    }));

    return transformed;
  } catch (error) {
    console.error('Failed to fetch packages:', error);
    return [];
  }
}

async function handleCreatePackage(event: any) {
  // Verify admin access
  const isAuthorized = await verifyAdminAuth(event);
  if (!isAuthorized) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized: Admin authentication required',
    });
  }

  const body = await readBody(event);

  if (!body.title || !body.price) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields',
    });
  }

  try {
    const collection = await getPackagesCollection();

    const newPackage: Package = {
      title: body.title,
      description: body.description || '',
      location: body.location || body.destination || '',
      destination: body.destination || body.location || '',
      duration: body.duration || '',
      price: parseFloat(body.price),
      rating: parseFloat(body.rating) || 4.7,
      image_url: body.image_url || '',
      category: body.category || 'Domestic',
      featured: body.featured || false,
      highlights: body.highlights || [],
      created_at: new Date(),
      updated_at: new Date(),
    };

    const result = await collection.insertOne(newPackage);

    return {
      id: result.insertedId.toString(),
      ...newPackage,
      created_at: newPackage.created_at.toISOString(),
      updated_at: newPackage.updated_at.toISOString(),
    };
  } catch (error) {
    console.error('Failed to create package:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create package',
    });
  }
}
