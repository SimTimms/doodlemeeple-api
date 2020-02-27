async function gallery(parent, args, context) {
  return await context.prisma.section({ id: parent.id }).gallery();
}

module.exports = {
  gallery,
};
