import { connectDB, getPackagesCollection } from '~/server/utils/db';
import { deleteUploadedFile } from '~/server/utils/uploads';
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
  const packageId = getRouterParam(event, 'id');

  if (!packageId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Package ID is required',
    });
  }

  try {
    // Ensure database connection
    await connectDB();

    if (method === 'PUT') {
      return await handleUpdatePackage(event, packageId);
    } else if (method === 'DELETE') {
      return await handleDeletePackage(event, packageId);
    } else if (method === 'GET') {
      return await handleGetPackage(event, packageId);
    } else {
      throw createError({
        statusCode: 405,
        statusMessage: 'Method Not Allowed',
      });
    }
  } catch (error) {
    console.error('Package API Error:', error);
    throw error;
  }
});

async function handleGetPackage(event: any, packageId: string) {
  try {
    const collection = await getPackagesCollection();
    let query: any = { id: packageId };

    // Try MongoDB ObjectId if packageId looks like one
    if (ObjectId.isValid(packageId)) {
      query = { $or: [{ _id: new ObjectId(packageId) }, { id: packageId }] };
    }

    const pkg = await collection.findOne(query);

    if (!pkg) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Package not found',
      });
    }

    return transformPackage(pkg);
  } catch (error) {
    console.error('Failed to fetch package:', error);
    throw error;
  }
}

async function handleUpdatePackage(event: any, packageId: string) {
  // Verify admin access
  const isAuthorized = await verifyAdminAuth(event);
  if (!isAuthorized) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized: Admin authentication required',
    });
  }

  const body = await readBody(event);

  try {
    const collection = await getPackagesCollection();
    let query: any = { id: packageId };

    if (ObjectId.isValid(packageId)) {
      query = { $or: [{ _id: new ObjectId(packageId) }, { id: packageId }] };
    }

    const updateData: any = {
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
      updated_at: new Date(),
    };

    const result = await collection.findOneAndUpdate(query, { $set: updateData }, { returnDocument: 'after' });

    if (!result.value) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Package not found',
      });
    }

    return transformPackage(result.value);
  } catch (error) {
    console.error('Failed to update package:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update package',
    });
  }
}

async function handleDeletePackage(event: any, packageId: string) {
  // Verify admin access
  const isAuthorized = await verifyAdminAuth(event);
  if (!isAuthorized) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized: Admin authentication required',
    });
  }

  try {
    const collection = await getPackagesCollection();
    let query: any = { id: packageId };

    if (ObjectId.isValid(packageId)) {
      query = { $or: [{ _id: new ObjectId(packageId) }, { id: packageId }] };
    }

    const pkg = await collection.findOne(query);

    if (pkg && pkg.image_url) {
      // Delete uploaded image if it's from our uploads directory
      if (pkg.image_url.startsWith('/uploads/')) {
        await deleteUploadedFile(pkg.image_url);
      }
    }

    const result = await collection.deleteOne(query);

    if (result.deletedCount === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Package not found',
      });
    }

    return { success: true, deletedCount: result.deletedCount };
  } catch (error) {
    console.error('Failed to delete package:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete package',
    });
  }
}

function transformPackage(pkg: any) {
  return {
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
  };
}
