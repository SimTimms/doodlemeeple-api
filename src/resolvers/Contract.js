async function job(parent, args, context) {
  return await context.prisma.contract({ id: parent.id }).job();
}

async function paymentTerms(parent, args, context) {
  return await context.prisma.contract({ id: parent.id }).paymentTerms();
}

module.exports = {
  job,
  paymentTerms,
};
