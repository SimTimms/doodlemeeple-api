const { getUserId } = require('../../../utils');
const { emailInvite } = require('../../../email');
const { createNotification } = require('../utils');
const { INVITED } = require('../../../utils/notifications');

async function updateMessage(parent, args, context, info) {
  const {
    name,
    img,
    summary,
    location,
    showreel,
    creativeSummary,
    submitted,
  } = args.message;
  const returnObj = await context.prisma.updateMessage({
    data: {
      name,
      img,
      summary,
      location,
      showreel,
      submitted,
      creativeSummary,
    },
    where: {
      id: args.id,
    },
  });

  return returnObj.id;
}

async function createMessage(parent, args, context, info) {
  const userId = getUserId(context);
  const {
    name,
    img,
    summary,
    location,
    showreel,
    submitted,
    gameId,
    creativeSummary,
  } = args.message;

  const returnObj = await context.prisma.createMessage({
    user: { connect: { id: userId } },
    name,
    img,
    summary,
    creativeSummary,
    submitted,
    location,
    showreel,
    game: { connect: { id: gameId } },
  });
  return returnObj.id;
}

async function removeMessage(parent, args, context) {
  await context.prisma.deleteMessage({
    id: args.id,
  });

  return true;
}

module.exports = {
  updateMessage,
  createMessage,
  removeMessage,
};
