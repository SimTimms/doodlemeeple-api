import { TestimonialTC } from '../models';

const TestimonialQuery = {
  testimonialById: TestimonialTC.getResolver('findById'),
  testimonialByIds: TestimonialTC.getResolver('findByIds'),
  testimonialOne: TestimonialTC.getResolver('findOne'),
  testimonialMany: TestimonialTC.getResolver('findMany'),
  testimonialCount: TestimonialTC.getResolver('count'),
  testimonialConnection: TestimonialTC.getResolver('connection'),
  testimonialPagination: TestimonialTC.getResolver('pagination'),
};

const TestimonialMutation = {
  testimonialCreateOne: TestimonialTC.getResolver('createOne'),
  testimonialCreateMany: TestimonialTC.getResolver('createMany'),
  testimonialUpdateById: TestimonialTC.getResolver('updateById'),
  testimonialUpdateOne: TestimonialTC.getResolver('updateOne'),
  testimonialUpdateMany: TestimonialTC.getResolver('updateMany'),
  testimonialRemoveById: TestimonialTC.getResolver('removeById'),
  testimonialRemoveOne: TestimonialTC.getResolver('removeOne'),
  testimonialRemoveMany: TestimonialTC.getResolver('removeMany'),
};

export { TestimonialQuery, TestimonialMutation };
