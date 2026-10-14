import path from 'node:path';
import { pathToFileURL } from 'node:url';
import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.js';
import Gig from '../src/models/Gig.js';
import Profile from '../src/models/Profile.js';
import { slugify } from '../src/utils/slugify.js';

const DATA_FILE =
  process.env.DATA_FILE ||
  path.resolve(process.cwd(), '../sr7-hub/src/data/fiverrServices.js');

function mapGig(r, i) {
  return {
    title: r.title || `Gig ${i + 1}`,
    slug: r.slug || r.id || slugify(r.title || `gig-${i + 1}`),
    price: r.price || 'TBD',
    delivery: r.delivery || 'TBD',
    status: r.status || 'placeholder',
    summary: r.summary || '',
    deliverables: Array.isArray(r.deliverables) ? r.deliverables : [],
    tags: Array.isArray(r.tags) ? r.tags : [],
    order: r.order ?? i,
    published: true,
  };
}

async function run() {
  await connectDB();
  const mod = await import(pathToFileURL(DATA_FILE).href);

  // --- Gigs ---
  const gigs = mod.fiverrGigs;
  if (!Array.isArray(gigs)) throw new Error('fiverrGigs export not found or not an array');
  console.log(`📦 Loaded ${gigs.length} gigs from ${DATA_FILE}`);

  const ops = gigs.map((r, i) => {
    const doc = mapGig(r, i);
    return {
      updateOne: { filter: { slug: doc.slug }, update: { $set: doc }, upsert: true, setDefaultsOnInsert: true },
    };
  });
  const res = await Gig.bulkWrite(ops, { ordered: false });
  console.log('✅ Gigs seed:', {
    matched: res.matchedCount, upserted: res.upsertedCount, modified: res.modifiedCount,
  });

  // --- Profile (singleton) ---
  const profileData = mod.fiverrProfile || {};
  let profile = await Profile.findOne({ key: 'fiverr' });
  if (profile) {
    Object.assign(profile, profileData);
    await profile.save();
    console.log('♻️  Profile updated');
  } else {
    await Profile.create({ key: 'fiverr', ...profileData });
    console.log('✅ Profile created');
  }

  console.log(`📊 Totals — Gigs: ${await Gig.countDocuments()}, Profiles: ${await Profile.countDocuments()}`);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});