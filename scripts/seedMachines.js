import path from 'node:path';
import { pathToFileURL } from 'node:url';
import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.js';
import Machine from '../src/models/Machine.js';
import { slugify } from '../src/utils/slugify.js';

const DATA_FILE =
  process.env.DATA_FILE ||
  path.resolve(process.cwd(), '../sr7-hub/src/data/htbMachines.js');

function mapRecord(r, i) {
  return {
    machineName: r.machineName || r.name || `Machine ${i + 1}`,
    slug: r.slug || r.id || slugify(r.machineName || r.name || `machine-${i + 1}`),
    difficulty: r.difficulty || '',
    os: r.os || '',
    summary: r.summary || '',
    ports: Array.isArray(r.ports) ? r.ports : [],
    tools: Array.isArray(r.tools) ? r.tools : [],
    phases: Array.isArray(r.phases)
      ? r.phases.map((p) => ({
          title: p.title || '',
          steps: Array.isArray(p.steps)
            ? p.steps.map((s) =>
                typeof s === 'string' ? { text: s, command: '' } : { text: s.text || '', command: s.command || '' }
              )
            : [],
        }))
      : [],
    userFlag: Boolean(r.userFlag ?? false),
    rootFlag: Boolean(r.rootFlag ?? false),
    retired: r.retired ?? true,
    url: r.url || '',
    tags: Array.isArray(r.tags) ? r.tags : [],
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

  const res = await Machine.bulkWrite(ops, { ordered: false });
  console.log('✅ Seed complete:', {
    matched: res.matchedCount,
    upserted: res.upsertedCount,
    modified: res.modifiedCount,
  });
  console.log(`📊 Total machines in DB: ${await Machine.countDocuments()}`);

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});