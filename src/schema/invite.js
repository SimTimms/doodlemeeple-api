import { InviteTC } from '../models';

const InviteQuery = {
  inviteById: InviteTC.getResolver('findById'),
  inviteByIds: InviteTC.getResolver('findByIds'),
  inviteOne: InviteTC.getResolver('findOne'),
  inviteMany: InviteTC.getResolver('findMany'),
  inviteCount: InviteTC.getResolver('count'),
  inviteConnection: InviteTC.getResolver('connection'),
  invitePagination: InviteTC.getResolver('pagination'),
};

const InviteMutation = {
  inviteCreateOne: InviteTC.getResolver('createOne'),
  inviteCreateMany: InviteTC.getResolver('createMany'),
  inviteUpdateById: InviteTC.getResolver('updateById'),
  inviteUpdateOne: InviteTC.getResolver('updateOne'),
  inviteUpdateMany: InviteTC.getResolver('updateMany'),
  inviteRemoveById: InviteTC.getResolver('removeById'),
  inviteRemoveOne: InviteTC.getResolver('removeOne'),
  inviteRemoveMany: InviteTC.getResolver('removeMany'),
};

export { InviteQuery, InviteMutation };
