import { SectionTC, User, Gallery } from '../models';
import { getUserId } from '../utils';

const SectionQuery = {
  sectionById: SectionTC.getResolver('findById'),
  sectionByIds: SectionTC.getResolver('findByIds'),
  sectionOne: SectionTC.getResolver('findOne'),
  sectionMany: SectionTC.getResolver('findMany'),
  sectionCount: SectionTC.getResolver('count'),
  sectionConnection: SectionTC.getResolver('connection'),
  sectionPagination: SectionTC.getResolver('pagination'),
};

const SectionMutation = {
  sectionCreateOne: SectionTC.getResolver('createOne').wrapResolve(
    (next) => async (rp) => {
      const userId = getUserId(rp.context.headers.authorization);
      rp.args.record.user = userId;

      const gallery = await Gallery.create({});
      rp.args.record.gallery = gallery._id;

      const section = await next(rp);
      await User.updateOne(
        { _id: userId },
        { $push: { sections: section.recordId } }
      );
      return section;
    }
  ),
  sectionCreateMany: SectionTC.getResolver('createMany'),
  sectionUpdateById: SectionTC.getResolver('updateById'),
  sectionUpdateOne: SectionTC.getResolver('updateOne'),
  sectionUpdateMany: SectionTC.getResolver('updateMany'),
  sectionRemoveById: SectionTC.getResolver('removeById').wrapResolve(
    (next) => async (rp) => {
      const userId = getUserId(rp.context.headers.authorization);
      await User.updateOne(
        { _id: userId },
        { $pull: { sections: rp.args._id } }
      );

      next(rp);
    }
  ),
  sectionRemoveOne: SectionTC.getResolver('removeOne'),
  sectionRemoveMany: SectionTC.getResolver('removeMany'),
};

export { SectionQuery, SectionMutation };
