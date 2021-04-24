import mongoose, { Schema } from 'mongoose';
import timestamps from 'mongoose-timestamp';
import { composeWithMongoose } from 'graphql-compose-mongoose';
import { UserTC, GalleryTC, NotableProjectTC, TestimonialTC, Image } from './';

export const SectionSchema = new Schema(
  {
    summary: { type: String },
    showreel: { type: String },
    type: { type: String, index: { unique: true } },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    gallery: {
      type: Schema.Types.ObjectId,
      ref: 'Gallery',
    },
    notableProjects: [
      {
        type: Schema.Types.ObjectId,
        ref: 'NotableProject',
      },
    ],
    testimonials: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Testimonial',
      },
    ],
  },
  {
    collection: 'sections',
  }
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

SectionTC.addFields({
  referenceImage: {
    type: 'String',
    description: 'Image',
    resolve: async (source, args, context, info) => {
      const img = await Image.findOne({
        category: source.type,
        user: info.variableValues.userId,
      });
      return img ? img.img : '';
    },
  },
});

SectionTC.addRelation('gallery', {
  resolver: () => GalleryTC.getResolver('findOne'),
  prepareArgs: {
    filter: ({ gallery }) => {
      return { _id: gallery };
    },
  },
  projection: { gallery: true, _id: true },
});

SectionTC.addRelation('notableProjects', {
  resolver: () => NotableProjectTC.getResolver('findMany'),
  prepareArgs: {
    filter: (source) => ({ section: source._id }),
  },
  projection: { id: true },
});

SectionTC.addRelation('testimonials', {
  resolver: () => TestimonialTC.getResolver('findMany'),
  prepareArgs: {
    filter: (source) => ({ section: source._id }),
  },
  projection: { id: true },
});
