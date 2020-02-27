async function gallery(parent, args, context) {
  console.log(parent);
  console.log(await context.prisma.gallery({ id: parent.id }));
  return context.prisma.section({ id: parent.id }).gallery();
}

module.exports = {
  gallery,
};
