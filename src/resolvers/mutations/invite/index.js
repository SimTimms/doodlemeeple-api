const { getUserId } = require('../../../utils');

async function updateInvite(parent, args, context, info) {
  const { name, img, backgroundImg, summary, location, showreel } = args.game;
  const returnObj = await context.prisma.updateGame({
    data: {
      name,
      img,
      backgroundImg,
      summary,
      location,
      showreel,
    },
    where: {
      id: args.id,
    },
  });

  return returnObj.id;
}

async function createInvite(parent, args, context, info) {
  const senderId = getUserId(context);
  const { title, message, gameId, jobId, userId } = args.invite;

  const returnObj = await context.prisma.createInvite({
    user: { connect: { id: senderId } },
    title,
    message,
    game: { connect: { id: gameId } },
    job: { connect: { id: jobId } },
    receiver: userId,
  });

  return returnObj.id;
}

async function removeInvite(parent, args, context) {
  await context.prisma.deleteGame({
    id: args.id,
  });

  return true;
}

module.exports = {
  updateInvite,
  createInvite,
  removeInvite,
};
