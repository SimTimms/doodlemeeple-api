async function invite(parent, args, context) {
  return await context.prisma.contract({ id: parent.id }).invite();
}
async function paymentTerms(parent, args, context) {
  return await context.prisma.contract({ id: parent.id }).paymentTerms();
}

module.exports = {
  invite,
  paymentTerms,
};
