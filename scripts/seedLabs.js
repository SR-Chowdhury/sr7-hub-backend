import path from 'node:path';
import { pathToFileURL } from 'node:url';
import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.js';
import Lab from '../src/models/Lab.js';
import { slugify } from '../src/utils/slugify.js';

const DATA_FILE = process.env.DATA_FILE ||
  path.resolve(process.cwd(), '../sr7-hub/src/data/portswiggerLabs.js');

function mapRecord(r, i) {
  return {
    labNumber: r.labNumber || '',
    title: r.title || r.name || `Untitled lab ${i + 1}`,
    slug: r.slug || slugify(r.title || r.name || `lab-${i + 1}`),
    category: r.category || 'Uncategorized',
    difficulty: r.difficulty || 'Apprentice',      // keep Title Case as-is
    summary: r.summary || r.description || '',
    criteria: Array.isArray(r.criteria) ? r.criteria : [],
    payload: r.payload || '',
    steps: Array.isArray(r.steps) ? r.steps : [],
    whyItWorks: r.whyItWorks || '',
    remediation: r.remediation || '',
    notes: r.notes || r.writeup || '',
    url: r.url || r.link || '',
    tags: Array.isArray(r.tags) ? r.tags : [],
    solved: Boolean(r.solved ?? false),
    solvedAt: r.solvedAt || null,
    order: r.order ?? i,
    published: true,
  };
}

async function loadArray() {
  const mod = await import(pathToFileURL(DATA_FILE).href);
  const arr = Object.values(mod).find(Array.isArray);
  if (!arr) throw new Error(`No array export found in ${DATA_FILE}`);
  return arr;
}

async function run() {
  await connectDB();
  const records = await loadArray();
  console.log(`📦 Loaded ${records.length} records from ${DATA_FILE}`);

  const ops = records.map((r, i) => {
    const doc = mapRecord(r, i);
    return {
      updateOne: {
        filter: { slug: doc.slug },
        update: { $set: doc },
        upsert: true,
        setDefaultsOnInsert: true,
      },
    };
  });

  const res = await Lab.bulkWrite(ops, { ordered: false });
  console.log('✅ Seed complete:', {
    matched: res.matchedCount,
    upserted: res.upsertedCount,
    modified: res.modifiedCount,
  });

  const total = await Lab.countDocuments();
  console.log(`📊 Total labs in DB: ${total}`);

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});