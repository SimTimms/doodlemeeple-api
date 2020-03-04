export async function createImages(images, imageIds, context) {
  const imageIdArr = Object.assign([], imageIds);
  for (let i = 0; i < images.length; i++) {
    const imageIn = images[i];
    const imageReturn = await context.prisma.createGalleryImage({
      img: imageIn.img,
    });
    imageIdArr.push({ id: imageReturn.id });
  }
  return imageIdArr;
}

export async function createNotification(message, userId, context) {
  await context.prisma.createNotification({
    user: { connect: { id: userId } },
    title: message.title,
    message: message.message,
    linkTo: message.linkTo,
    icon: message.icon,
  });
}
