async function user(parent, args, context) {
  return await context.prisma.job({ id: parent.id }).user();
}

async function game(parent, args, context) {
  return await context.prisma.job({ id: parent.id }).game();
}

async function invite(parent, args, context) {
  return await context.prisma.job({ id: parent.id }).invite();
}

module.exports = {
  user,
  game,
  invite,
};
