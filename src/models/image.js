import mongoose, { Schema } from 'mongoose';
import { composeWithMongoose } from 'graphql-compose-mongoose';
import { UserTC, GalleryTC } from './';

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
  },
  {
    collection: 'images',
  }
);

export const Image = mongoose.model('Image', ImageSchema);
export const ImageTC = composeWithMongoose(Image);

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
