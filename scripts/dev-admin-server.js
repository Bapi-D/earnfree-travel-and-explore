/* Lightweight local admin server for development.

Run with:
  SERVICE_ACCOUNT_PATH=./serviceAccountKey.json ADMIN_API_KEY=... node scripts/dev-admin-server.js

It listens on port 8788 by default and exposes POST /__admin/create-user
with same behavior as the Cloudflare worker admin endpoint.
*/

import fs from 'fs';
import http from 'http';
import url from 'url';

async function main() {
  const port = process.env.DEV_ADMIN_PORT ? Number(process.env.DEV_ADMIN_PORT) : 8788;
  const adminApiKey = process.env.ADMIN_API_KEY || '';

  let serviceAccount = null;
  if (process.env.SERVICE_ACCOUNT_JSON) {
    try {
      serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_JSON);
    } catch (err) {
      console.error('Failed to parse SERVICE_ACCOUNT_JSON', err);
      process.exit(1);
    }
  } else {
    const p = process.env.SERVICE_ACCOUNT_PATH || './serviceAccountKey.json';
    if (!fs.existsSync(p)) {
      console.error('Service account file not found at', p);
      process.exit(1);
    }
    serviceAccount = JSON.parse(fs.readFileSync(p, 'utf8'));
  }

  // Normalize private key
  if (serviceAccount.private_key && typeof serviceAccount.private_key === 'string') {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n').trim();
  }

  function toIso(value) {
    if (!value) return null;
    if (typeof value === 'string') return value;
    if (value instanceof Date) return value.toISOString();
    if (typeof value === 'object' && typeof value.toDate === 'function') return value.toDate().toISOString();
    return null;
  }

  const admin = await import('firebase-admin').then(m => m.default ?? m);
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  console.log('Local Firebase Admin server initialized');

  function serializeEnquiry(doc) {
    const data = doc.data() || {};
    return {
      id: doc.id,
      full_name: data.full_name || data.customer_name || data.name || '',
      email: data.email || '',
      phone: data.phone || '',
      destination: data.destination || '',
      travel_date: data.travel_date || '',
      travelers: Number(data.travelers || 0),
      message: data.message || '',
      status: data.status || 'pending',
      created_at: toIso(data.created_at),
      updated_at: toIso(data.updated_at),
    };
  }

  function serializeProfile(doc) {
    const data = doc.data() || {};
    return {
      id: doc.id,
      full_name: data.full_name || '',
      email: data.email || '',
      phone: data.phone || '',
      avatar_url: data.avatar_url || '',
      created_at: toIso(data.created_at),
      updated_at: toIso(data.updated_at),
    };
  }

  function withCors(headers = {}) {
    return {
      ...headers,
      'Access-Control-Allow-Origin': 'http://localhost:5173',
      'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'content-type, authorization',
      'Access-Control-Allow-Credentials': 'true',
      Vary: 'Origin',
    };
  }

  const server = http.createServer(async (req, res) => {
    const parsed = url.parse(req.url || '', true);
    if (parsed.pathname === '/__admin/profiles') {
      if (req.method === 'OPTIONS') {
        res.writeHead(204, withCors());
        res.end();
        return;
      }

      if (req.method === 'GET') {
        try {
          const snapshot = await admin.firestore().collection('profiles').limit(200).get();
          res.writeHead(200, withCors({ 'Content-Type': 'application/json' }));
          res.end(JSON.stringify(snapshot.docs.map(serializeProfile)));
        } catch (err) {
          console.error('Admin profiles list error:', err);
          res.writeHead(500, withCors({ 'Content-Type': 'application/json' }));
          res.end(JSON.stringify({ error: 'internal_error', message: String(err) }));
        }
        return;
      }

      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      let body = null;
      try {
        body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {};
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'invalid_payload' }));
        return;
      }

      try {
        const db = admin.firestore();

        if (req.method === 'POST') {
          const profileId = String(body?.id || '').trim();
          const fullName = String(body?.full_name || '').trim();
          const email = String(body?.email || '').trim();
          const phone = String(body?.phone || '').trim();
          const avatarUrl = String(body?.avatar_url || '').trim();

          if (!profileId || !fullName || !email) {
            res.writeHead(400, withCors({ 'Content-Type': 'application/json' }));
            res.end(JSON.stringify({ error: 'invalid_payload' }));
            return;
          }

          await db.collection('profiles').doc(profileId).set({
            id: profileId,
            full_name: fullName,
            email,
            phone,
            avatar_url: avatarUrl,
            created_at: body?.created_at || admin.firestore.FieldValue.serverTimestamp(),
            updated_at: admin.firestore.FieldValue.serverTimestamp(),
          }, { merge: true });

          const saved = await db.collection('profiles').doc(profileId).get();
          res.writeHead(200, withCors({ 'Content-Type': 'application/json' }));
          res.end(JSON.stringify({ ok: true, profile: serializeProfile(saved) }));
          return;
        }

        if (req.method === 'DELETE') {
          const id = String(body?.id || '').trim();

          if (!id) {
            res.writeHead(400, withCors({ 'Content-Type': 'application/json' }));
            res.end(JSON.stringify({ error: 'missing_id' }));
            return;
          }

          const docRef = db.collection('profiles').doc(id);
          const snapshot = await docRef.get();

          if (!snapshot.exists) {
            res.writeHead(404, withCors({ 'Content-Type': 'application/json' }));
            res.end(JSON.stringify({ error: 'not_found' }));
            return;
          }

          await Promise.allSettled([
            db.collection('profile_files').where('profile_id', '==', id).get().then((filesSnap) => Promise.all(filesSnap.docs.map((fileDoc) => fileDoc.ref.delete()))),
            db.collection('user_roles').doc(id).delete(),
            db.collection('staff_profiles').doc(id).delete(),
            docRef.delete(),
          ]);

          res.writeHead(200, withCors({ 'Content-Type': 'application/json' }));
          res.end(JSON.stringify({ ok: true }));
          return;
        }

        res.writeHead(405, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'method_not_allowed' }));
      } catch (err) {
        console.error('Admin profiles error:', err);
        res.writeHead(405, withCors({ 'Content-Type': 'application/json' }));
        res.end(JSON.stringify({ error: 'internal_error', message: String(err) }));
      }

        res.writeHead(500, withCors({ 'Content-Type': 'application/json' }));
    }

    if (parsed.pathname === '/__admin/enquiries') {
      if (req.method === 'GET') {
        try {
          const snapshot = await admin.firestore().collection('enquiries').orderBy('created_at', 'desc').get();
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(snapshot.docs.map(serializeEnquiry)));
        } catch (err) {
          console.error('Admin enquiries list error:', err);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'internal_error', message: String(err) }));
        }
        return;
      }

      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      let body = null;
      try {
        body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {};
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'invalid_payload' }));
        return;
      }

      try {
        const db = admin.firestore();

        if (req.method === 'POST') {
          const record = {
            full_name: String(body?.customer_name || body?.full_name || body?.name || '').trim(),
            customer_name: String(body?.customer_name || body?.full_name || body?.name || '').trim(),
            email: String(body?.email || '').trim(),
            phone: String(body?.phone || '').trim(),
            destination: String(body?.destination || '').trim(),
            travel_date: String(body?.travel_date || '').trim(),
            travelers: Number(body?.travelers || 0),
            message: String(body?.message || '').trim(),
            status: 'pending',
            created_at: admin.firestore.FieldValue.serverTimestamp(),
            updated_at: admin.firestore.FieldValue.serverTimestamp(),
          };

          const docRef = await db.collection('enquiries').add(record);
          const saved = await docRef.get();
          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(serializeEnquiry(saved)));
          return;
        }

        if (req.method === 'PATCH') {
          const id = String(body?.id || '').trim();
          const status = String(body?.status || '').trim();

          if (!id) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'missing_id' }));
            return;
          }

          const docRef = db.collection('enquiries').doc(id);
          const snapshot = await docRef.get();

          if (!snapshot.exists) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'not_found' }));
            return;
          }

          await docRef.update({
            status,
            updated_at: admin.firestore.FieldValue.serverTimestamp(),
          });

          const updated = await docRef.get();
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(serializeEnquiry(updated)));
          return;
        }

        if (req.method === 'DELETE') {
          const id = String(body?.id || '').trim();

          if (!id) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'missing_id' }));
            return;
          }

          const docRef = db.collection('enquiries').doc(id);
          const snapshot = await docRef.get();

          if (!snapshot.exists) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'not_found' }));
            return;
          }

          await docRef.delete();
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: true }));
          return;
        }

        res.writeHead(405, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'method_not_allowed' }));
      } catch (err) {
        console.error('Admin enquiries error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'internal_error', message: String(err) }));
      }

      return;
    }

    // Analytics endpoints
    if (parsed.pathname === '/__admin/analytics' || parsed.pathname === '/__admin/analytics/visit') {
      const db = admin.firestore();

      if (req.method === 'POST' && parsed.pathname === '/__admin/analytics/visit') {
        const chunks = [];
        for await (const chunk of req) chunks.push(chunk);
        let body = {};
        try {
          body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {};
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'invalid_payload' }));
          return;
        }

        try {
          const record = {
            path: String(body?.path || '/'),
            user_agent: String(body?.userAgent || '').slice(0, 1024),
            device: String(body?.device || 'unknown'),
            returning: Boolean(body?.returning || false),
            visitor_id: body?.visitor_id ? String(body?.visitor_id).slice(0, 128) : null,
            created_at: admin.firestore.FieldValue.serverTimestamp(),
          };

          // Stronger dedupe using analytics_visitors map with last_seen timestamp
          const dedupeHours = process.env.DEV_ADMIN_DEDUPE_HOURS ? Number(process.env.DEV_ADMIN_DEDUPE_HOURS) : 12;
          if (record.visitor_id) {
            const visitorRef = db.collection('analytics_visitors').doc(record.visitor_id);
            const visitorSnap = await visitorRef.get();
            const now = new Date();
            let shouldInsert = true;
            if (visitorSnap.exists) {
              const lastSeen = visitorSnap.data()?.last_seen;
              const lastDate = lastSeen && typeof lastSeen.toDate === 'function' ? lastSeen.toDate() : new Date(0);
              const diffMs = now.getTime() - lastDate.getTime();
              if (diffMs < dedupeHours * 3600 * 1000) {
                shouldInsert = false;
              }
            }

            if (!shouldInsert) {
              // update last_seen to now (optional)
              await visitorRef.set({ last_seen: admin.firestore.FieldValue.serverTimestamp(), visit_count: admin.firestore.FieldValue.increment(1) }, { merge: true });
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ ok: true, deduped: true }));
              return;
            }

            // insert visit and update visitor map
            const docRef = await db.collection('analytics_visits').add(record);
            await visitorRef.set({ last_seen: admin.firestore.FieldValue.serverTimestamp(), visit_count: admin.firestore.FieldValue.increment(1) }, { merge: true });
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ id: docRef.id, ok: true }));
            return;
          }

          // No visitor_id — just insert
          const docRef = await db.collection('analytics_visits').add(record);
          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ id: docRef.id, ok: true }));
          return;
        } catch (err) {
          console.error('Record visit error:', err);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'internal_error', message: String(err) }));
          return;
        }
      }

      if (req.method === 'GET' && parsed.pathname === '/__admin/analytics') {
        try {
          // compute current month range
          const now = new Date();
          const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
          const end = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0);

          const visitsSnap = await db.collection('analytics_visits')
            .where('created_at', '>=', start)
            .where('created_at', '<', end)
            .get();

          const enquiriesSnap = await db.collection('enquiries')
            .where('created_at', '>=', start)
            .where('created_at', '<', end)
            .get();

          const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
          const daily = Array.from({ length: daysInMonth }).map((_, i) => ({
            date: new Date(now.getFullYear(), now.getMonth(), i + 1).toISOString().slice(0, 10),
            visitors: 0,
            enquiries: 0,
          }));

          visitsSnap.docs.forEach((d) => {
            const dData = d.data() || {};
            const ts = dData.created_at && dData.created_at.toDate ? dData.created_at.toDate() : new Date();
            const day = ts.getDate();
            if (daily[day - 1]) daily[day - 1].visitors += 1;
          });

          enquiriesSnap.docs.forEach((d) => {
            const dData = d.data() || {};
            const ts = dData.created_at && dData.created_at.toDate ? dData.created_at.toDate() : new Date();
            const day = ts.getDate();
            if (daily[day - 1]) daily[day - 1].enquiries += 1;
          });

          const totalVisitors = visitsSnap.docs.length;
          const totalEnquiries = enquiriesSnap.docs.length;

          // device breakdown
          const deviceCounts = {};
          let returningCount = 0;
          visitsSnap.docs.forEach((d) => {
            const dData = d.data() || {};
            const device = String(dData.device || 'unknown');
            deviceCounts[device] = (deviceCounts[device] || 0) + 1;
            if (dData.returning) returningCount += 1;
          });

          const newCount = totalVisitors - returningCount;
          const conversionRate = totalVisitors > 0 ? Math.round((totalEnquiries / totalVisitors) * 10000) / 100 : 0;

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ totalVisitors, totalEnquiries, daily, deviceCounts, returningCount, newCount, conversionRate }));
          return;
        } catch (err) {
          console.error('Analytics GET error:', err);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'internal_error', message: String(err) }));
          return;
        }
      }

      res.writeHead(405, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'method_not_allowed' }));
      return;
    }

      // Storage proxy: GET /__admin/storage?name=<object-path>
      if (parsed.pathname === '/__admin/storage') {
        if (req.method !== 'GET') {
          res.writeHead(405, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'method_not_allowed' }));
          return;
        }

        const name = parsed.query?.name || parsed.query?.file || '';
        if (!name) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'missing_name' }));
          return;
        }

        try {
          // Resolve bucket name from env or service account fallback
          const bucketName = process.env.SERVICE_ACCOUNT_BUCKET || process.env.FIREBASE_STORAGE_BUCKET || process.env.VITE_FIREBASE_STORAGE_BUCKET || (serviceAccount && serviceAccount.project_id ? `${serviceAccount.project_id}.appspot.com` : null);
          if (!bucketName) {
            throw new Error('Storage proxy: bucket name not configured (set SERVICE_ACCOUNT_BUCKET or FIREBASE_STORAGE_BUCKET env)');
          }
          const bucket = admin.storage().bucket(bucketName);
          const file = bucket.file(String(name));
          const [exists] = await file.exists();
          if (!exists) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'not_found' }));
            return;
          }

          const [meta] = await file.getMetadata();
          res.writeHead(200, {
            'Content-Type': meta.contentType || 'application/octet-stream',
            'Cache-Control': 'public, max-age=3600',
            'Access-Control-Allow-Origin': '*',
          });

          const stream = file.createReadStream();
          stream.on('error', (err) => {
            console.error('Storage proxy stream error:', err);
            try {
              res.writeHead(502, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'bad_gateway' }));
            } catch (e) {}
          });
          stream.pipe(res);
          return;
        } catch (err) {
          console.error('Storage proxy error:', err);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'internal_error', message: String(err) }));
          return;
        }
      }

    if (parsed.pathname === '/__admin/create-user') {
      if (req.method !== 'POST') {
        res.writeHead(405, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'method_not_allowed' }));
        return;
      }

      // simple header-based auth when admin key provided
      const provided = req.headers['x-admin-key'] || '';
      let authorized = false;
      if (adminApiKey && provided === adminApiKey) {
        authorized = true;
      } else {
        const authHeader = req.headers.authorization || '';
        const token = authHeader.toLowerCase().startsWith('bearer ') ? authHeader.slice(7).trim() : '';
        if (token) {
          try {
            const decoded = await admin.auth().verifyIdToken(token);
            if (decoded.role === 'admin') authorized = true;
            else if (decoded.uid) {
              const roleDoc = await admin.firestore().collection('user_roles').doc(decoded.uid).get();
              authorized = roleDoc.exists && roleDoc.data()?.role === 'admin';
            }
          } catch (err) {
            console.warn('Token verification failed:', err);
          }
        }
      }

      if (!authorized) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'unauthorized' }));
        return;
      }

      // read body
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      let body = null;
      try {
        body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'invalid_payload' }));
        return;
      }

      const { email, password, displayName, role, phone, staff_number } = body || {};
      if (!email) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'invalid_payload' }));
        return;
      }

      try {
        let userRecord;
        try {
          userRecord = await admin.auth().getUserByEmail(email);
          if (role) await admin.auth().setCustomUserClaims(userRecord.uid, { role });
        } catch (getErr) {
          userRecord = await admin.auth().createUser({ email, password: password || Math.random().toString(36).slice(2), displayName });
          if (role) await admin.auth().setCustomUserClaims(userRecord.uid, { role });
        }

        const db = admin.firestore();
        const resolvedName = userRecord.displayName || displayName || '';
        const resolvedRole = role || 'staff';
        await Promise.all([
          db.collection('profiles').doc(userRecord.uid).set({ full_name: resolvedName, email: userRecord.email, phone: phone || '', created_at: admin.firestore.FieldValue.serverTimestamp() }, { merge: true }),
          db.collection('user_roles').doc(userRecord.uid).set({ full_name: resolvedName, email: userRecord.email, role: resolvedRole, created_at: admin.firestore.FieldValue.serverTimestamp() }, { merge: true }),
          db.collection('staff_profiles').doc(userRecord.uid).set({ id: userRecord.uid, user_id: userRecord.uid, email: userRecord.email, full_name: resolvedName, staff_number: Number.isFinite(Number(staff_number)) ? Number(staff_number) : 1, active: true, created_at: admin.firestore.FieldValue.serverTimestamp() }, { merge: true }),
        ]);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ uid: userRecord.uid }));
      } catch (err) {
        console.error('Admin create-user error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'internal_error', message: String(err) }));
      }

      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'not_found' }));
  });

  server.listen(port, () => console.log(`Dev admin server listening on http://localhost:${port}`));
}

main().catch(err => { console.error(err); process.exit(1); });
