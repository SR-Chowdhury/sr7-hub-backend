import path from 'node:path';
import { pathToFileURL } from 'node:url';
import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.js';
import Audit from '../src/models/Audit.js';
import { slugify } from '../src/utils/slugify.js';

const DATA_FILE =
  process.env.DATA_FILE ||
  path.resolve(process.cwd(), '../sr7-hub/src/data/audits.js');

function mapRecord(r, i) {
  return {
    title: r.title || `Audit ${i + 1}`,
    slug: r.slug || r.id || slugify(r.title || `audit-${i + 1}`),
    client: r.client || '',
    category: r.category || '',
    environment: r.environment || '',
    duration: r.duration || '',
    summary: r.summary || '',
    confidentialityNote: r.confidentialityNote || '',
    tools: Array.isArray(r.tools) ? r.tools : [],
    scope: Array.isArray(r.scope)
      ? r.scope.map((s) => ({ label: s.label || '', value: s.value || '' }))
      : [],
    methodology: Array.isArray(r.methodology)
      ? r.methodology.map((m) => ({ step: m.step || '', tool: m.tool || '', purpose: m.purpose || '' }))
      : [],
    findingsSummary: r.findingsSummary || {},
    criticalFindings: Array.isArray(r.criticalFindings)
      ? r.criticalFindings.map((f) => ({
          fid: f.id || '',
          title: f.title || '',
          severity: f.severity || '',
          detail: f.detail || '',
          fix: f.fix || '',
        }))
      : [],
    remediation: Array.isArray(r.remediation)
      ? r.remediation.map((x) => ({ action: x.action || '', result: x.result || '' }))
      : [],
    beforeAfter: r.beforeAfter || {},
    recommendations: Array.isArray(r.recommendations) ? r.recommendations : [],
    lessons: Array.isArray(r.lessons) ? r.lessons : [],
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
      updateOne: { filter: { slug: doc.slug }, update: { $set: doc }, upsert: true, setDefaultsOnInsert: true },
    };
  });

  const res = await Audit.bulkWrite(ops, { ordered: false });
  console.log('✅ Seed complete:', {
    matched: res.matchedCount,
    upserted: res.upsertedCount,
    modified: res.modifiedCount,
  });
  console.log(`📊 Total audits in DB: ${await Audit.countDocuments()}`);

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});