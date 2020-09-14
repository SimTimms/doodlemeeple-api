import { UserTC, Notification, User } from '../models';
import { userRegistration } from '../resolversNew';
import { REGISTRATION, CREATE_JOB } from '../utils/notifications';
import { getUserId } from '../utils';

const UserQuery = {
  userById: UserTC.getResolver('findById'),
  userByIds: UserTC.getResolver('findByIds'),
  userOne: UserTC.getResolver('findOne'),
  userMany: UserTC.getResolver('findMany'),
  userCount: UserTC.getResolver('count'),
  userConnection: UserTC.getResolver('connection'),
  userPagination: UserTC.getResolver('pagination'),
  profile: UserTC.getResolver('profile'),
  getCreatives: UserTC.getResolver('getCreatives'),
};

const UserMutation = {
  userCreateOne: UserTC.getResolver('createOne').wrapResolve(
    (next) => async (rp) => {
      const updatedUser = await userRegistration(rp);
      const newUser = await next(updatedUser);
      await Notification.create({ ...CREATE_JOB, user: newUser.recordId });
      await Notification.create({ ...REGISTRATION, user: newUser.recordId });

      return newUser;
    }
  ),
  deleteAccount: UserTC.getResolver('deleteAccount'),
  userCreateMany: UserTC.getResolver('createMany'),
  userUpdateById: UserTC.getResolver('updateById'),
  userUpdateOne: UserTC.getResolver('updateOne').wrapResolve(
    (next) => async (rp) => {
      const userId = getUserId(rp.context.headers.authorization);
      const UpdatedUser = await User.findByIdAndUpdate(
        {
          _id: userId,
        },
        {
          ...rp.args.record,
        }
      );
      return UpdatedUser;
    }
  ),
  userUpdateMany: UserTC.getResolver('updateMany'),
  userRemoveById: UserTC.getResolver('removeById'),
  userRemoveOne: UserTC.getResolver('removeOne'),
  userRemoveMany: UserTC.getResolver('removeMany'),
  userLogin: UserTC.getResolver('login'),
  userMigrate: UserTC.getResolver('userMigrate'),
  updateProfile: UserTC.getResolver('updateProfile'),
  passwordForgot: UserTC.getResolver('passwordForgot'),
  passwordReset: UserTC.getResolver('passwordReset'),
};

export { UserQuery, UserMutation };
