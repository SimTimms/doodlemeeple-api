const { getUserId } = require('../../../utils');

async function addFavourite(parent, args, context) {
  const userId = getUserId(context);

  const thisUser = await context.prisma.user({
    id: userId,
  });
  let favArray = thisUser.favourites;

  args.addRemove === 'add' &&
    favArray.indexOf(args.id) === -1 &&
    favArray.push(args.id);

  if (args.addRemove === 'remove') {
    favArray = favArray.filter((item) => item !== args.id);
  }

  await context.prisma.updateUser({
    data: {
      favourites: { set: favArray },
    },
    where: {
      id: userId,
    },
  });

  return args.id;
}

module.exports = {
  addFavourite,
};
