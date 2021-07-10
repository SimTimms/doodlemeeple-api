import mongoose, { Schema } from 'mongoose';
import { composeWithMongoose } from 'graphql-compose-mongoose';
import { UserTC, GalleryTC, Section, Gallery } from './';
const ObjectId = mongoose.Types.ObjectId;

export const ImageSchema = new Schema(
  {
    img: { type: String },
    title: { type: String },
    gallery: {
      type: Schema.Types.ObjectId,
      ref: 'Gallery',
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    category: { type: String },
  },
  {
    collection: 'images',
  }
);

export const Image = mongoose.model('Image', ImageSchema);
export const ImageTC = composeWithMongoose(Image);

ImageTC.addResolver({
  name: 'imageCategory',
  type: [ImageTC],
  args: { type: ['String'] },
  kind: 'query',
  resolve: async (rp) => {
    const section = await Section.findOne({ type: { $in: rp.args.type } });
    const img = await Image.aggregate([
      { $match: { category: section.type } },
      { $sample: { size: 1 } },
    ]);
    return img;
  },
});

ImageTC.addResolver({
  name: 'profileImages',
  type: [ImageTC],
  args: { userId: 'MongoID!' },
  kind: 'query',
  resolve: async (rp) => {
    const img = await Image.aggregate([
      { $match: { user: ObjectId(rp.args.userId) } },
      { $sample: { size: 5 } },
    ]);
    return img;
  },
});

ImageTC.addResolver({
  name: 'categoriseImages',
  type: 'Boolean',
  args: {},
  kind: 'mutation',
  resolve: async (rp) => {
    const section = await Section.find();

    for (let i = 0; i < section.length; i++) {
      const images = await Image.find({ gallery: section[i].gallery });
      const imageIds = images.filter((image) => image._id);
      await Image.updateMany(
        { _id: { $in: imageIds } },
        { category: section[i].type }
      );
    }

    return true;
  },
});

ImageTC.addRelation('gallery', {
  resolver: () => GalleryTC.getResolver('findOne'),
  prepareArgs: {
    filter: (source) => ({ id: source._id }),
  },
  projection: { id: true },
});

ImageTC.addRelation('user', {
  resolver: () => UserTC.getResolver('findOne'),
  prepareArgs: {
    filter: (source) => ({ id: source._id }),
  },
  projection: { id: true },
});
