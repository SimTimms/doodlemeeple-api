async function user(parent, args, context) {
  return await context.prisma.job({ id: parent.id }).user();
}

async function game(parent, args, context) {
  return await context.prisma.job({ id: parent.id }).game();
}

module.exports = {
  user,
  game,
};
