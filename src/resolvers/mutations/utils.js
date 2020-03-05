async function createImages(images, imageIds, context) {
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
async function createNotification(message, userId, context) {
  await context.prisma.createNotification({
    user: { connect: { id: userId } },
    title: message.title,
    message: message.message,
    linkTo: message.linkTo,
    icon: message.icon,
  });
}

async function notableProjectsCreator(ids, notableProjects, context) {
  const notableIdsArr = Object.assign([], ids);
  for (let i = 0; i < notableProjects.length; i++) {
    const notableProjectsIn = notableProjects[i];
    const projectExists = await context.prisma.$exists.notableProjects({
      id: notableProjectsIn.id,
    });

    if (!projectExists) {
      if (notableProjects.length < 6) {
        const notableReturn = await context.prisma.createNotableProjects({
          name: notableProjectsIn.name,
          summary: notableProjectsIn.summary,
        });
        notableIdsArr.push({ id: notableReturn.id });
      }
    } else {
      await context.prisma.updateNotableProjects({
        data: {
          name: notableProjectsIn.name,
          summary: notableProjectsIn.summary,
        },
        where: { id: notableProjectsIn.id },
      });
    }
  }
  return notableIdsArr;
}

async function testimonialsCreator(ids, inputArr, context) {
  const idsArr = Object.assign([], ids);
  for (let i = 0; i < inputArr.length; i++) {
    const inputArrItem = inputArr[i];
    const projectExists = await context.prisma.$exists.testimonial({
      id: inputArrItem.id,
    });

    if (!projectExists) {
      if (inputArr.length < 6) {
        const notableReturn = await context.prisma.createTestimonial({
          name: inputArrItem.name,
          summary: inputArrItem.summary,
        });
        idsArr.push({ id: notableReturn.id });
      }
    } else {
      await context.prisma.updateTestimonial({
        data: {
          name: inputArrItem.name,
          summary: inputArrItem.summary,
        },
        where: { id: inputArrItem.id },
      });
    }
  }
  return idsArr;
}

module.exports = {
  createNotification,
  createImages,
  notableProjectsCreator,
  testimonialsCreator,
};
