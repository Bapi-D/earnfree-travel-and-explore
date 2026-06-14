import { saveUploadedFile } from '~/server/utils/uploads';
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

import { defineEventHandler, readMultipartFormData, getHeader, getCookie, createError } from 'h3';

export default defineEventHandler(async (event) => {
  // Verify admin access
  const isAuthorized = await verifyAdminAuth(event);
  if (!isAuthorized) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized: Admin authentication required',
    });
  }

  try {
    // Handle multipart form data with file upload
    const form = await readMultipartFormData(event);

    if (!form) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No file uploaded',
      });
    }

    const fileField = form.find((field) => field.name === 'file');

    if (!fileField) {
      throw createError({
        statusCode: 400,
        statusMessage: 'File field not found',
      });
    }

    // Read buffer directly from multipart field (no browser File dependency)
    const buffer: Buffer = fileField.data;
    const filename = fileField.filename || 'upload';


    // Validate file size (max 5MB)
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    if (buffer.length > MAX_FILE_SIZE) {
      throw createError({
        statusCode: 413,
        statusMessage: 'File too large. Maximum size is 5MB',
      });
    }

    // Validate file type
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const mimeType = fileField.type || 'image/jpeg';
    if (!ALLOWED_TYPES.includes(mimeType)) {
      throw createError({
        statusCode: 415,
        statusMessage: 'Unsupported file type. Allowed: jpeg, png, webp, gif',
      });
    }



    // Save the file (server-side buffer; no browser File dependency)
    const imageUrl = await saveUploadedFile({
      buffer,
      originalName: filename,
      mimeType,
    });


    return {
      success: true,
      imageUrl: imageUrl,
      filename: filename,
    };
  } catch (error) {
    console.error('Upload error:', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : 'Failed to upload file',
    });
  }
});

