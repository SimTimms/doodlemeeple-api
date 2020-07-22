async function game(parent, args, context) {
  return await context.prisma.invite({ id: parent.id }).game();
}

async function user(parent, args, context) {
  return await context.prisma.invite({ id: parent.id }).user();
}

async function job(parent, args, context) {
  return await context.prisma.invite({ id: parent.id }).job();
}

async function receiver(parent, args, context) {
  return await context.prisma.invite({ id: parent.id }).receiver();
}

async function contracts(parent, args, context) {
  return await context.prisma.invite({ id: parent.id }).contracts();
}

module.exports = {
  game,
  user,
  job,
  receiver,
  contracts,
};