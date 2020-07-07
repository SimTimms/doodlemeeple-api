import { UserTC, Notification } from '../models';
import { userRegistration } from '../resolvers';
import { REGISTRATION } from '../utils/notifications';

const UserQuery = {
  userById: UserTC.getResolver('findById'),
  userByIds: UserTC.getResolver('findByIds'),
  userOne: UserTC.getResolver('findOne'),
  userMany: UserTC.getResolver('findMany'),
  userCount: UserTC.getResolver('count'),
  userConnection: UserTC.getResolver('connection'),
  userPagination: UserTC.getResolver('pagination'),
  profile: UserTC.getResolver('profile'),
};

const UserMutation = {
  userCreateOne: UserTC.getResolver('createOne').wrapResolve(
    (next) => async (rp) => {
      const updatedUser = await userRegistration(rp);
      const newUser = await next(updatedUser);
      Notification.create({ ...REGISTRATION, user: newUser.recordId });
      return newUser;
    },
  ),
  userCreateMany: UserTC.getResolver('createMany'),
  userUpdateById: UserTC.getResolver('updateById'),
  userUpdateOne: UserTC.getResolver('updateOne'),
  userUpdateMany: UserTC.getResolver('updateMany'),
  userRemoveById: UserTC.getResolver('removeById'),
  userRemoveOne: UserTC.getResolver('removeOne'),
  userRemoveMany: UserTC.getResolver('removeMany'),
  userLogin: UserTC.getResolver('login'),
  profile: UserTC.getResolver('profile'),
};

export { UserQuery, UserMutation };
