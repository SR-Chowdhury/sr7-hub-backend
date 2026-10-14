import mongoose from 'mongoose';
import ApiError from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { slugify } from '../utils/slugify.js';

const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function buildCrud(Model, opts = {}) {
  const {
    slugFrom = 'title',
    searchFields = [],
    filterFields = [],
    sortDefault = 'order createdAt',
    populate = [],
    hasPublished = true,
  } = opts;

  const keyFor = (id) =>
    mongoose.isValidObjectId(id) ? { _id: id } : { slug: id };

  const list = asyncHandler(async (req, res) => {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 100, 500);
    const { q, sort = sortDefault, all } = req.query;

    const filter = {};
    for (const f of filterFields) {
      const v = req.query[f];
      if (v === undefined || v === '') continue;
      if (v === 'true') filter[f] = true;
      else if (v === 'false') filter[f] = false;
      else if (typeof v === 'string')
        filter[f] = { $regex: `^${escapeRegex(v)}$`, $options: 'i' };
      else filter[f] = v;
    }

    if (q && searchFields.length) {
      filter.$or = searchFields.map((f) => ({ [f]: { $regex: q, $options: 'i' } }));
    }

    if (hasPublished && req.user?.role !== 'admin') filter.published = true;

    const noLimit = all === 'true';
    const effectiveLimit = noLimit ? 0 : limit;
    const skip = noLimit ? 0 : (page - 1) * limit;

    const [data, total] = await Promise.all([
      Model.find(filter).sort(sort).skip(skip).limit(effectiveLimit).populate(populate),
      Model.countDocuments(filter),
    ]);

    res.json({
      data,
      meta: {
        total,
        page,
        limit: noLimit ? total : limit,
        pages: noLimit ? 1 : Math.ceil(total / limit) || 1,
      },
    });
  });

  const getOne = asyncHandler(async (req, res) => {
    const doc = await Model.findOne(keyFor(req.params.id)).populate(populate);
    if (!doc) throw new ApiError(404, `${Model.modelName} not found`);
    res.json({ data: doc });
  });

  const create = asyncHandler(async (req, res) => {
    const body = { ...req.body };
    if (slugFrom && !body.slug && body[slugFrom]) body.slug = slugify(body[slugFrom]);
    const doc = await Model.create(body);
    res.status(201).json({ data: doc });
  });

  const update = asyncHandler(async (req, res) => {
    const doc = await Model.findOne(keyFor(req.params.id));
    if (!doc) throw new ApiError(404, `${Model.modelName} not found`);

    const { _id, __v, createdAt, ...patch } = req.body;
    Object.assign(doc, patch);
    if (slugFrom && patch[slugFrom] && !patch.slug) doc.slug = slugify(patch[slugFrom]);

    await doc.save();
    res.json({ data: doc });
  });

  const remove = asyncHandler(async (req, res) => {
    const doc = await Model.findOneAndDelete(keyFor(req.params.id));
    if (!doc) throw new ApiError(404, `${Model.modelName} not found`);
    res.json({ data: { id: doc._id, deleted: true } });
  });

  const bulkUpsert = asyncHandler(async (req, res) => {
    const items = Array.isArray(req.body) ? req.body : req.body.items;
    if (!Array.isArray(items)) throw new ApiError(400, 'Expected an array of items');

    const ops = items.map((item) => {
      const doc = { ...item };
      if (slugFrom && !doc.slug && doc[slugFrom]) doc.slug = slugify(doc[slugFrom]);
      const filter = doc.slug ? { slug: doc.slug } : { _id: new mongoose.Types.ObjectId() };
      return {
        updateOne: { filter, update: { $set: doc }, upsert: true, setDefaultsOnInsert: true },
      };
    });

    const result = await Model.bulkWrite(ops, { ordered: false });
    res.json({
      data: {
        matched: result.matchedCount,
        upserted: result.upsertedCount,
        modified: result.modifiedCount,
      },
    });
  });

  return { list, getOne, create, update, remove, bulkUpsert };
}