import mongoose, { Schema } from 'mongoose';
import { composeWithMongoose } from 'graphql-compose-mongoose';

export const TestimonialSchema = new Schema(
  {
    summary: { type: String },
    image: { type: String },
    name: { type: String },
    status: { type: Boolean },
  },
  {
    collection: 'testimonials',
  },
);

export const Testimonial = mongoose.model('Testimonial', TestimonialSchema);
export const TestimonialTC = composeWithMongoose(Testimonial);
