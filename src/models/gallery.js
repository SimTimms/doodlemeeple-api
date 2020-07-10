import mongoose, { Schema } from 'mongoose';
import { composeWithMongoose } from 'graphql-compose-mongoose';
import { ImageTC } from './';

export const GallerySchema = new Schema(
  {
    summary: { type: String },
    images: {
      type: Schema.Types.ObjectId,
      ref: 'Image',
    },
  },
  {
    collection: 'galleries',
  }
);

export const Gallery = mongoose.model('Gallery', GallerySchema);
export const GalleryTC = composeWithMongoose(Gallery);

GalleryTC.addRelation('images', {
  resolver: () => ImageTC.getResolver('findMany'),
  prepareArgs: {
    filter: (source) => ({ gallery: source._id }),
  },
  projection: { id: true },
});
