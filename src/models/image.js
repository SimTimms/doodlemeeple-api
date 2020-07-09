import mongoose, { Schema } from 'mongoose';
import { composeWithMongoose } from 'graphql-compose-mongoose';

export const ImageSchema = new Schema(
  {
    img: { type: String },
    title: { type: String },
  },
  {
    collection: 'images',
  },
);

export const Image = mongoose.model('Image', ImageSchema);
export const ImageTC = composeWithMongoose(Image);
