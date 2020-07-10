import mongoose, { Schema } from 'mongoose';
import { composeWithMongoose } from 'graphql-compose-mongoose';
import { SectionTC } from './';

export const TestimonialSchema = new Schema(
  {
    summary: { type: String },
    image: { type: String },
    name: { type: String },
    status: { type: Boolean },
    section: {
      type: Schema.Types.ObjectId,
      ref: 'Section',
    },
  },
  {
    collection: 'testimonials',
  }
);

export const Testimonial = mongoose.model('Testimonial', TestimonialSchema);
export const TestimonialTC = composeWithMongoose(Testimonial);

TestimonialTC.addRelation('section', {
  resolver: () => SectionTC.getResolver('findOne'),
  prepareArgs: {
    filter: (source) => ({ id: source._id }),
  },
  projection: { id: true },
});
