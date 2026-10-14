import mongoose from 'mongoose';
import { slugify } from '../utils/slugify.js';

const stepSchema = new mongoose.Schema(
  { text: { type: String, default: '' }, command: { type: String, default: '' } },
  { _id: false }
);

const phaseSchema = new mongoose.Schema(
  { title: { type: String, default: '' }, steps: { type: [stepSchema], default: [] } },
  { _id: false }
);

const walkthroughSchema = new mongoose.Schema(
  {
    machineName: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    difficulty: { type: String, default: '', index: true },
    os: { type: String, default: '', index: true },
    source: { type: String, default: '' },        // vulnhub.com link
    goal: { type: String, default: '' },
    summary: { type: String, default: '' },
    tools: { type: [String], default: [], index: true },
    phases: { type: [phaseSchema], default: [] },
    keyFindings: { type: [String], default: [] },
    flag: { type: String, default: '' },
    remediation: { type: String, default: '' },
    notes: { type: String, default: '' },
    tags: { type: [String], default: [] },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.id = ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

walkthroughSchema.index({ machineName: 'text', summary: 'text', notes: 'text' });

walkthroughSchema.pre('validate', function () {
  if (this.machineName && !this.slug) this.slug = slugify(this.machineName);
});

export default mongoose.model('Walkthrough', walkthroughSchema);