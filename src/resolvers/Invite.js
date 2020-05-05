async function game(parent, args, context) {
  return await context.prisma.invite({ id: parent.id }).game();
}

async function user(parent, args, context) {
  return await context.prisma.invite({ id: parent.id }).user();
}

async function job(parent, args, context) {
  return await context.prisma.invite({ id: parent.id }).job();
}

module.exports = {
  game,
  user,
  job,
};
