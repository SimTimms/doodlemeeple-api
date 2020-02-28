const { getUserId } = require('../../utils');

async function updateGallerySection(parent, args, context, info) {
  console.log('Gallery Update');
  const userId = getUserId(context);

  await context.prisma.createNotification({
    user: { connect: { id: userId } },
    title: 'You updated a gallery',
    message: 'Make sure you showcase your best work',
    linkTo: 'edit-profile',
    icon: 'contact_mail',
  });

  const sectionExists = await context.prisma.$exists.section({
    id: args.id,
  });

  if (sectionExists) {
    const sectionObject = await context.prisma.section({
      id: args.id,
    });

    let imageIds = [];
    const { gallery, title, summary } = args.section;
    const { images } = gallery;

    for (let i = 0; i < images.length; i++) {
      const imageIn = images[i];
      const imageReturn = await context.prisma.createGalleryImage({
        img: imageIn.img,
      });
      imageIds.push({ id: imageReturn.id });
    }

    let galleryObject = sectionObject.gallery ? sectionObject.gallery : null;

    if (galleryObject) {
      await context.prisma.updateGallery({
        images: { connect: imageIds },
      });
    } else {
      galleryObject = await context.prisma.createGallery({
        images: { connect: imageIds },
      });
    }

    const section = await context.prisma.updateSection({
      data: {
        title: title,
        summary: summary,
        gallery: { connect: { id: galleryObject.id } },
      },
      where: {
        id: args.id,
      },
    });

    return section;
  } else {
    let imageIds = [];
    const { gallery, title, summary } = args.section;
    const { images } = gallery;

    for (let i = 0; i < images.length; i++) {
      const imageIn = images[i];
      const imageReturn = await context.prisma.createGalleryImage({
        img: imageIn.img,
      });
      imageIds.push({ id: imageReturn.id });
    }

    const newGallery = await context.prisma.createGallery({
      images: { connect: imageIds },
    });

    const newSection = await context.prisma.createSection({
      user: { connect: { id: userId } },
      title: title,
      summary: summary,
      gallery: { connect: { id: newGallery.id } },
    });

    return newSection;
  }
}

async function updateSection(parent, args, context, info) {
  console.log('Gallery Updatse');
  const userId = getUserId(context);

  await context.prisma.createNotification({
    user: { connect: { id: userId } },
    title: 'Profile Updated!',
    message: "It's good that you did that",
    linkTo: 'edit-profile',
    icon: 'contact_mail',
  });

  const sectionExists = await context.prisma.$exists.section({
    id: args.id,
  });

  if (sectionExists) {
    const section = await context.prisma.updateSection({
      data: {
        title: args.section.title,
        summary: args.section.summary,
      },
      where: {
        id: args.id,
      },
    });

    return section;
  } else {
    const { title, summary } = args.section;

    const newSection = await context.prisma.createSection({
      user: { connect: { id: userId } },
      title: title,
      summary: summary,
    });

    return newSection;
  }
}

module.exports = {
  updateGallerySection,
  updateSection,
};
