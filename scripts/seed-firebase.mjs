import fs from 'fs/promises';
import path from 'path';
import admin from 'firebase-admin';

function exitWith(msg) {
  console.error(msg);
  process.exit(1);
}

async function loadServiceAccount() {
  if (process.env.SERVICE_ACCOUNT_JSON) {
    try {
      return JSON.parse(process.env.SERVICE_ACCOUNT_JSON);
    } catch (err) {
      exitWith('Failed to parse SERVICE_ACCOUNT_JSON: ' + err.message);
    }
  }

  const p = process.env.SERVICE_ACCOUNT_PATH || './serviceAccountKey.json';
  try {
    const raw = await fs.readFile(path.resolve(p), 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    exitWith(`Failed to load service account from ${p}: ${err.message}`);
  }
}

async function ensureUser(auth, { email, password, displayName, role }) {
  try {
    const user = await auth.getUserByEmail(email);
    console.log(`User already exists: ${email} (uid=${user.uid})`);
    await auth.setCustomUserClaims(user.uid, { role });
    return user;
  } catch (err) {
    if (err.code && (err.code === 'auth/user-not-found' || err.code === 'auth/user-not-found')) {
      // create
    } else if (err.code && err.code === 'auth/user-not-found') {
      // continue
    } else if (err.code && err.code === 'auth/user-not-found') {
      // continue
    }
    // create user
  }

  try {
    const user = await auth.createUser({ email, password, displayName });
    console.log(`Created user: ${email} (uid=${user.uid})`);
    await auth.setCustomUserClaims(user.uid, { role });
    return user;
  } catch (err) {
    exitWith('Failed to create user ' + email + ': ' + err.message);
  }
}

async function seed() {
  const serviceAccount = await loadServiceAccount();

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  const auth = admin.auth();
  const db = admin.firestore();

  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!';
  const staffEmail = process.env.SEED_STAFF_EMAIL || 'staff@example.com';
  const staffPassword = process.env.SEED_STAFF_PASSWORD || 'ChangeMe123!';

  console.log('Seeding Firebase project...');

  const adminUser = await ensureUser(auth, { email: adminEmail, password: adminPassword, displayName: 'Admin', role: 'admin' });
  const staffUser = await ensureUser(auth, { email: staffEmail, password: staffPassword, displayName: 'Staff', role: 'staff' });

  // Create staff_profiles docs
  const staffProfilesRef = db.collection('staff_profiles');

  await staffProfilesRef.doc(adminUser.uid).set({
    uid: adminUser.uid,
    email: adminUser.email,
    name: adminUser.displayName || 'Admin',
    role: 'admin',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  await staffProfilesRef.doc(staffUser.uid).set({
    uid: staffUser.uid,
    email: staffUser.email,
    name: staffUser.displayName || 'Staff',
    role: 'staff',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Create a sample package
  const packagesRef = db.collection('packages');
  const pkgDoc = packagesRef.doc();
  await pkgDoc.set({
    id: pkgDoc.id,
    title: 'Sample Package',
    description: 'This is a seeded sample package.',
    price: 99,
    image_url: '',
    created_at: admin.firestore.FieldValue.serverTimestamp(),
  });

  console.log('Seeding complete. Details:');
  console.log(`Admin email: ${adminEmail}`);
  console.log(`Staff email: ${staffEmail}`);
  console.log('Please change the seeded passwords immediately or remove these accounts.');
  console.log('If you want to run again, provide SERVICE_ACCOUNT_PATH or SERVICE_ACCOUNT_JSON env var.');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
