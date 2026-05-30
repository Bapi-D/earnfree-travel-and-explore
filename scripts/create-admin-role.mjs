import fs from 'fs/promises';
import path from 'path';
import admin from 'firebase-admin';

async function loadServiceAccount() {
  const p = process.env.SERVICE_ACCOUNT_PATH || './serviceAccountKey.json';
  const raw = await fs.readFile(path.resolve(p), 'utf8');
  return JSON.parse(raw);
}

async function main() {
  const serviceAccount = await loadServiceAccount();
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  const auth = admin.auth();
  const db = admin.firestore();

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@earnfree.com';

  const user = await auth.getUserByEmail(adminEmail).catch(() => null);
  if (!user) {
    console.error('No Firebase Auth user found with email:', adminEmail);
    process.exit(1);
  }

  const roleDoc = db.collection('user_roles').doc(user.uid);
  await roleDoc.set({
    id: user.uid,
    email: user.email,
    full_name: user.displayName || 'Admin',
    role: 'admin',
    created_at: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });

  console.log(`Created/updated user_roles for ${adminEmail} (uid=${user.uid})`);
}

main().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
