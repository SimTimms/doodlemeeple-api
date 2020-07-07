import mongoose, { Schema } from 'mongoose';
import timestamps from 'mongoose-timestamp';
import { composeWithMongoose } from 'graphql-compose-mongoose';
import { UserTC } from './';

export const SectionSchema = new Schema(
  {
    title: { type: String, required: true },
    summary: { type: String },
    showreel: { type: String },
    type: { type: String },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    collection: 'sections',
  },
);

SectionSchema.plugin(timestamps);

SectionSchema.index({ createdAt: 1, updatedAt: 1 });

export const Section = mongoose.model('Section', SectionSchema);
export const SectionTC = composeWithMongoose(Section);

SectionTC.addRelation('user', {
  resolver: () => UserTC.getResolver('findOne'),
  prepareArgs: {
    filter: (source) => ({ id: source._id }),
  },
  projection: { id: true },
});
