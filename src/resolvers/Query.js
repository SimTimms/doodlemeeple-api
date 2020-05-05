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

async function getGalleries(parent, args, context) {
  const sections = await context.prisma.galleries({
    where: {
      section: {
        id_in: args.sectionId,
      },
    },
  });

  return sections;
}

async function getImages(parent, args, context) {
  const sections = await context.prisma.galleryImages({
    where: {
      gallery: {
        id_in: args.galleryId,
      },
    },
  });
  return sections;
}

async function sectionsPreview(parent, args, context) {
  const userId = args.userId;
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

async function getGame(parent, args, context, info) {
  const game = await context.prisma.game({
    id: args.gameId,
  });

  return game;
}

async function getGames(parent, args, context, info) {
  const userId = getUserId(context);
  const games = await context.prisma.games({
    where: {
      user: {
        id: userId,
      },
    },
  });

  return games;
}

async function getJob(parent, args, context, info) {
  const job = await context.prisma.job({
    id: args.jobId,
  });

  return job;
}

async function getJobs(parent, args, context, info) {
  const userId = getUserId(context);
  const games = await context.prisma.jobs({
    where: {
      user: {
        id: userId,
      },
    },
  });

  return games;
}

async function profilePreview(parent, args, context, info) {
  const userId = args.userId;

  const profile = await context.prisma.user({
    id: userId,
  });

  return profile;
}

async function getTestimonials(parent, args, context) {
  const section = await context.prisma.sections({
    where: {
      id: args.sectionId,
    },
  });

  return section;
}

async function getCreatives(parent, args, context) {
  const section = await context.prisma.users();

  return section;
}

async function getInvites(parent, args, context) {
  const userId = getUserId(context);
  const invites = await context.prisma.invites({
    where: {
      receiver: userId,
    },
  });
  console.log(invites);

  return invites;
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
    first: 5,
  });

  return notifications;
}

module.exports = {
  profile,
  getNotifications,
  getSections,
  getGalleries,
  getImages,
  getTestimonials,
  profilePreview,
  getGame,
  getGames,
  getJob,
  getJobs,
  sectionsPreview,
  getCreatives,
  getInvites,
};
