import mongoose from 'mongoose';
import { slugify } from '../utils/slugify.js';

const scopeSchema = new mongoose.Schema(
  { label: { type: String, default: '' }, value: { type: String, default: '' } },
  { _id: false }
);
const methodologySchema = new mongoose.Schema(
  { step: { type: String, default: '' }, tool: { type: String, default: '' }, purpose: { type: String, default: '' } },
  { _id: false }
);
const findingSchema = new mongoose.Schema(
  { fid: { type: String, default: '' }, title: { type: String, default: '' }, severity: { type: String, default: '' }, detail: { type: String, default: '' }, fix: { type: String, default: '' } },
  { _id: false }
);
const remediationSchema = new mongoose.Schema(
  { action: { type: String, default: '' }, result: { type: String, default: '' } },
  { _id: false }
);
const countsSchema = new mongoose.Schema(
  { total: { type: Number, default: 0 }, critical: { type: Number, default: 0 }, high: { type: Number, default: 0 }, medium: { type: Number, default: 0 }, low: { type: Number, default: 0 } },
  { _id: false }
);
const beforeAfterSchema = new mongoose.Schema(
  { before: { total: { type: Number, default: 0 }, critical: { type: Number, default: 0 } }, after: { total: { type: Number, default: 0 }, critical: { type: Number, default: 0 } } },
  { _id: false }
);

const auditSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    client: { type: String, default: '' },
    category: { type: String, default: '', index: true },
    environment: { type: String, default: '' },
    duration: { type: String, default: '' },
    summary: { type: String, default: '' },
    confidentialityNote: { type: String, default: '' },
    tools: { type: [String], default: [] },
    scope: { type: [scopeSchema], default: [] },
    methodology: { type: [methodologySchema], default: [] },
    findingsSummary: { type: countsSchema, default: () => ({}) },
    criticalFindings: { type: [findingSchema], default: [] },
    remediation: { type: [remediationSchema], default: [] },
    beforeAfter: { type: beforeAfterSchema, default: () => ({}) },
    recommendations: { type: [String], default: [] },
    lessons: { type: [String], default: [] },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => { ret.id = ret._id; delete ret.__v; return ret; },
    },
  }
);

auditSchema.index({ title: 'text', summary: 'text' });
auditSchema.pre('validate', function () {
  if (this.title && !this.slug) this.slug = slugify(this.title);
});

export default mongoose.model('Audit', auditSchema);