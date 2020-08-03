import { InviteTC, User, Invite, Job } from '../models';
import { getUserId } from '../utils';

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
  inviteCreateOne: InviteTC.getResolver('createOne').wrapResolve(
    (next) => async (rp) => {
      const userId = getUserId(rp.context.headers.authorization);
      const exists = await Invite.findOne({
        receiver: rp.args.record.receiver,
        job: rp.args.record.job,
      });

      if (!exists) {
        const newInvite = await next(rp);

        await Job.updateOne(
          { _id: rp.args.record.job },
          { $addToSet: { invites: newInvite.recordId } }
        );

        return newInvite;
      } else {
        await Job.updateOne(
          { _id: rp.args.record.job },
          { $pull: { invites: exists._id } }
        );

        await Invite.remove({ _id: exists._id });
      }
      return exists._id;
    }
  ),
  inviteCreateMany: InviteTC.getResolver('createMany'),
  inviteUpdateById: InviteTC.getResolver('updateById'),
  inviteUpdateOne: InviteTC.getResolver('updateOne'),
  inviteUpdateMany: InviteTC.getResolver('updateMany'),
  inviteRemoveById: InviteTC.getResolver('removeById'),
  inviteRemoveOne: InviteTC.getResolver('removeOne'),
  inviteRemoveMany: InviteTC.getResolver('removeMany'),
};

export { InviteQuery, InviteMutation };
