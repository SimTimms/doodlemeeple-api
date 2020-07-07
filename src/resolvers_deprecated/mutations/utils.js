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
          image: notableProjectsIn.image,
        });
        notableIdsArr.push({ id: notableReturn.id });
      }
    } else {
      await context.prisma.updateNotableProjects({
        data: {
          name: notableProjectsIn.name,
          summary: notableProjectsIn.summary,
          image: notableProjectsIn.image,
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
    const exists = await context.prisma.$exists.testimonial({
      id: inputArrItem.id,
    });

    if (!exists) {
      if (inputArr.length < 6) {
        const testimonialReturn = await context.prisma.createTestimonial({
          name: inputArrItem.name,
          summary: inputArrItem.summary,
          image: inputArrItem.image,
        });
        idsArr.push({ id: testimonialReturn.id });
      }
    } else {
      await context.prisma.updateTestimonial({
        data: {
          name: inputArrItem.name,
          summary: inputArrItem.summary,
          image: inputArrItem.image,
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
