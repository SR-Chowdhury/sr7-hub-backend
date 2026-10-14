import mongoose from 'mongoose';
import { slugify } from '../utils/slugify.js';

const labSchema = new mongoose.Schema(
  {
    // --- Identity ---
    labNumber: { type: String, default: '' },     // "LAB 01"
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },

    // --- Classification ---
    category: { type: String, required: true, index: true },
    difficulty: {
      type: String,
      enum: ['Apprentice', 'Practitioner', 'Expert'],
      default: 'Apprentice',
      index: true,
    },

    // --- Content ---
    summary: { type: String, default: '' },
    criteria: { type: [String], default: [] },
    payload: { type: String, default: '' },
    steps: { type: [String], default: [] },
    whyItWorks: { type: String, default: '' },
    remediation: { type: String, default: '' },
    notes: { type: String, default: '' },

    // --- Meta ---
    url: { type: String, default: '' },
    tags: { type: [String], default: [], index: true },
    solved: { type: Boolean, default: false, index: true },
    solvedAt: { type: Date, default: null },
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

labSchema.index({ title: 'text', summary: 'text', notes: 'text' });

labSchema.pre('validate', function () {
  if (this.title && !this.slug) this.slug = slugify(this.title);
  if (this.solved && !this.solvedAt) this.solvedAt = new Date();
  if (!this.solved) this.solvedAt = null;
});

export default mongoose.model('Lab', labSchema);