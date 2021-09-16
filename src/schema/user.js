import { UserTC, Notification, User, Log } from '../models';
import { userRegistration } from '../resolversNew';
import { REGISTRATION, CREATE_JOB } from '../utils/notifications';
import { getUserId } from '../utils';
const stripe = require('stripe')(process.env.STRIPE_KEY, {
  apiVersion: '2020-03-02',
});

const UserQuery = {
  userById: UserTC.getResolver('findById'),
  userByIdWithTracker: UserTC.getResolver('userByIdWithTracker'),
  userByIds: UserTC.getResolver('findByIds'),
  userOne: UserTC.getResolver('findOne'),
  userMany: UserTC.getResolver('findMany'),
  userCount: UserTC.getResolver('count'),
  userConnection: UserTC.getResolver('connection'),
  userPagination: UserTC.getResolver('pagination'),
  profile: UserTC.getResolver('profile'),
  getCreatives: UserTC.getResolver('getCreatives'),
  featuredProfile: UserTC.getResolver('featuredProfile'),
  featuredCreativesWidget: UserTC.getResolver('featuredCreativesWidget'),
  creativeRosterWidget: UserTC.getResolver('creativeRosterWidget'),
  latestCreativesWidget: UserTC.getResolver('latestCreativesWidget'),
  getLikes: UserTC.getResolver('getLikes'),
  creativeMinis: UserTC.getResolver('creativeMinis'),
  getStripe: UserTC.getResolver('getStripe').wrapResolve(
    (next) => async (rp) => {
      const userId = getUserId(rp.context.headers.authorization);
      const user = await User.findOne({
        _id: userId,
      });

      const account = user.stripeID
        ? await stripe.accounts.retrieve(`${user.stripeID}`)
        : false;

      return account;
    }
  ),
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
  skipOnboarding: UserTC.getResolver('skipOnboarding'),
};

export { UserQuery, UserMutation };
