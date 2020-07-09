import mongoose, { Schema } from 'mongoose';
import { composeWithMongoose } from 'graphql-compose-mongoose';

export const NotableProjectSchema = new Schema(
  {
    summary: { type: String },
    image: { type: String },
    name: { type: String },
  },
  {
    collection: 'notableProjects',
  },
);

export const NotableProject = mongoose.model(
  'NotableProject',
  NotableProjectSchema,
);
export const NotableProjectTC = composeWithMongoose(NotableProject);
