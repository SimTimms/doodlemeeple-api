import { BadgeTC } from '../models';

const BadgeQuery = {
  badgeById: BadgeTC.getResolver('findById'),
  badgeByIds: BadgeTC.getResolver('findByIds'),
  badgeOne: BadgeTC.getResolver('findOne'),
  badgeMany: BadgeTC.getResolver('findMany'),
  badgeCount: BadgeTC.getResolver('count'),
  badgeConnection: BadgeTC.getResolver('connection'),
  badgePagination: BadgeTC.getResolver('pagination'),
};

const BadgeMutation = {
  badgeCreateOne: BadgeTC.getResolver('createOne'),
  badgeCreateMany: BadgeTC.getResolver('createMany'),
  badgeUpdateById: BadgeTC.getResolver('updateById'),
  badgeUpdateOne: BadgeTC.getResolver('updateOne'),
  badgeUpdateMany: BadgeTC.getResolver('updateMany'),
  badgeRemoveById: BadgeTC.getResolver('removeById'),
  badgeRemoveOne: BadgeTC.getResolver('removeOne'),
  badgeRemoveMany: BadgeTC.getResolver('removeMany'),
};

export { BadgeQuery, BadgeMutation };
