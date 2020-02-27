const { getUserId } = require('../utils');

async function getSections(parent, args, context) {
  const userId = getUserId(context);
  const sections = await context.prisma.sections({
    where: {
      user: {
        id: userId,
      },
    },
  });
  return sections;
}
async function profile(parent, args, context, info) {
  const userId = getUserId(context);

  const profile = await context.prisma.user({
    id: userId,
  });

  return profile;
}
async function getNotifications(parent, args, context) {
  const userId = getUserId(context);

  const notifications = await context.prisma.notifications({
    where: {
      user: {
        id: userId,
      },
    },
    skip: 0,
    first: 20,
  });

  return notifications;
}

module.exports = {
  profile,
  getNotifications,
  getSections,
};
