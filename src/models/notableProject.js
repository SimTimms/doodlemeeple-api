import mongoose, { Schema } from 'mongoose';
import { composeWithMongoose } from 'graphql-compose-mongoose';
import { SectionTC } from './';

export const NotableProjectSchema = new Schema(
  {
    summary: { type: String },
    image: { type: String },
    name: { type: String },
    section: {
      type: Schema.Types.ObjectId,
      ref: 'Section',
    },
  },
  {
    collection: 'notableProjects',
  }
);

export const NotableProject = mongoose.model(
  'NotableProject',
  NotableProjectSchema
);
export const NotableProjectTC = composeWithMongoose(NotableProject);

NotableProjectTC.addRelation('section', {
  resolver: () => SectionTC.getResolver('findOne'),
  prepareArgs: {
    filter: (source) => ({ id: source._id }),
  },
  projection: { id: true },
});
