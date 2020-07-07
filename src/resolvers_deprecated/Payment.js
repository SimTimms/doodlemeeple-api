async function paidBy(parent, args, context) {
  return await context.prisma.payment({ id: parent.id }).paidBy();
}

async function contract(parent, args, context) {
  return await context.prisma.payment({ id: parent.id }).contract();
}

module.exports = {
  paidBy,
  contract,
};
