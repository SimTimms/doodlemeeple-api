const { getUserId } = require('../../../utils');

async function updateGame(parent, args, context, info) {
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

async function createGame(parent, args, context, info) {
  const userId = getUserId(context);
  const { name, img, backgroundImg, summary, location, showreel } = args.game;
  const returnObj = await context.prisma.createGame({
    user: { connect: { id: userId } },
    name,
    img,
    backgroundImg,
    summary,
    location,
    showreel,
  });
  return returnObj.id;
}

async function removeGame(parent, args, context) {
  await context.prisma.deleteGame({
    id: args.id,
  });

  return true;
}

module.exports = {
  updateGame,
  createGame,
  removeGame,
};
