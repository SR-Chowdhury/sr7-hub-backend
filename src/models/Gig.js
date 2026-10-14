import mongoose from 'mongoose';
import { slugify } from '../utils/slugify.js';

const gigSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    price: { type: String, default: 'TBD' },        // "Coming Soon" | "£50" etc
    delivery: { type: String, default: 'TBD' },     // "3 days"
    status: {
      type: String,
      enum: ['active', 'placeholder', 'paused'],
      default: 'placeholder',
      index: true,
    },
    summary: { type: String, default: '' },
    deliverables: { type: [String], default: [] },
    tags: { type: [String], default: [], index: true },
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

gigSchema.index({ title: 'text', summary: 'text' });

gigSchema.pre('validate', function () {
  if (this.title && !this.slug) this.slug = slugify(this.title);
});

export default mongoose.model('Gig', gigSchema);