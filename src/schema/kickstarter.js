import { KickstarterTC } from '../models';
import { getUserId } from '../utils';

const KickstarterQuery = {
  kickstarterById: KickstarterTC.getResolver('findById'),
  kickstarterByIds: KickstarterTC.getResolver('findByIds'),
  kickstarterOne: KickstarterTC.getResolver('findOne'),
  kickstarterMany: KickstarterTC.getResolver('findMany'),
  kickstarterCount: KickstarterTC.getResolver('count'),
  kickstarterConnection: KickstarterTC.getResolver('connection'),
  kickstarterPagination: KickstarterTC.getResolver('pagination'),
  featuredKickstarterWidget: KickstarterTC.getResolver(
    'featuredKickstarterWidget'
  ),
  kickstarterWidget: KickstarterTC.getResolver('kickstarterWidget'),
  myKickstarters: KickstarterTC.getResolver('myKickstarters'),
};

const KickstarterMutation = {
  kickstarterCreateOne: KickstarterTC.getResolver('createOne').wrapResolve(
    (next) => async (rp) => {
      const userId = getUserId(rp.context.headers.authorization);
      rp.args.record.user = userId;

      const kickstarter = await next(rp);
      return kickstarter;
    }
  ),
  kickstarterCreateMany: KickstarterTC.getResolver('createMany'),
  kickstarterUpdateById: KickstarterTC.getResolver('updateById'),
  kickstarterUpdateOne: KickstarterTC.getResolver('updateOne'),
  kickstarterUpdateMany: KickstarterTC.getResolver('updateMany'),
  kickstarterRemoveById: KickstarterTC.getResolver('removeById'),
  kickstarterRemoveOne: KickstarterTC.getResolver('removeOne'),
  kickstarterRemoveMany: KickstarterTC.getResolver('removeMany'),
};

export { KickstarterQuery, KickstarterMutation };
