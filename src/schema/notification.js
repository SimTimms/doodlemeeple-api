import { NotificationTC } from '../models';

const NotificationQuery = {
  notificationById: NotificationTC.getResolver('findById'),
  notificationByIds: NotificationTC.getResolver('findByIds'),
  notificationOne: NotificationTC.getResolver('findOne'),
  notificationMany: NotificationTC.getResolver('findMany'),
  notificationCount: NotificationTC.getResolver('count'),
  notificationConnection: NotificationTC.getResolver('connection'),
  notificationPagination: NotificationTC.getResolver('pagination'),
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
