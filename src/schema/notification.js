import { NotificationTC } from '../models';
import { getUserId } from '../utils';

const NotificationQuery = {
  notificationById: NotificationTC.getResolver('findById'),
  notificationByIds: NotificationTC.getResolver('findByIds'),
  notificationOne: NotificationTC.getResolver('findOne'),
  notificationMany: NotificationTC.getResolver('findMany').wrapResolve(
    (next) => (rp) => {
      const userId = getUserId(rp.context.headers.authorization);
      rp.args.filter = { ...rp.args.filter, user: userId };
      rp.args.sort = { createdAt: -1 };
      return next(rp);
    }
  ),
  notificationCount: NotificationTC.getResolver('count'),
  notificationConnection: NotificationTC.getResolver('connection'),
  notificationPagination: NotificationTC.getResolver('pagination'),
  notificationSecure: NotificationTC.getResolver('notificationSecure'),
};

const NotificationMutation = {
  notificationCreateOne: NotificationTC.getResolver('createOne'),
  notificationCreateMany: NotificationTC.getResolver('createMany'),
  notificationUpdateById: NotificationTC.getResolver('updateById'),
  notificationUpdateOne: NotificationTC.getResolver('updateOne'),
  notificationUpdateMany: NotificationTC.getResolver('updateMany'),
  notificationRemoveById: NotificationTC.getResolver('removeById'),
  notificationRemoveOne: NotificationTC.getResolver('removeOne'),
  notificationRemoveMany: NotificationTC.getResolver('removeMany'),
};

export { NotificationQuery, NotificationMutation };
