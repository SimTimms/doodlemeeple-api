import mongoose, { Schema } from 'mongoose';
import timestamps from 'mongoose-timestamp';
import { composeWithMongoose } from 'graphql-compose-mongoose';

export const WebshopSchema = new Schema(
  {
    name: { type: String },
    logo: { type: String },
    url: { type: String },
    price: { type: String },
  },
  {
    collection: 'webshops',
  }
);

WebshopSchema.plugin(timestamps);
WebshopSchema.index({ createdAt: 1, updatedAt: 1 });

export const Webshop = mongoose.model('Webshop', WebshopSchema);
export const WebshopTC = composeWithMongoose(Webshop);
