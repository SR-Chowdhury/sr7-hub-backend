import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'fiverr', unique: true, immutable: true },
    username: { type: String, default: '' },
    profileUrl: { type: String, default: '' },
    tagline: { type: String, default: '' },
    responseTime: { type: String, default: '' },
    memberSince: { type: String, default: '' },
    location: { type: String, default: '' },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => { ret.id = ret._id; delete ret.__v; return ret; },
    },
  }
);

export default mongoose.model('Profile', profileSchema);