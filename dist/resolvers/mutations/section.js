"use strict";

const {
  getUserId
} = require('../../utils');

const {
  createImages
} = require('./utils');

const {
  updateProject,
  createProject
} = require('./project');

const {
  updateTestimonial,
  createTestimonial
} = require('./testimonial');

async function updateGallerySection(parent, args, context, info) {
  const {
    gallery,
    title,
    summary,
    showreel,
    type
  } = args.section;
  const {
    images
  } = gallery;
  let imageIds = [];
  const sectionObject = await context.prisma.section({
    id: args.id
  });
  imageIds = await createImages(images, imageIds, context);
  let galleryObject = sectionObject.gallery ? sectionObject.gallery : null;

  if (galleryObject) {
    await context.prisma.updateGallery({
      images: {
        connect: imageIds
      }
    });
  } else {
    galleryObject = await context.prisma.createGallery({
      images: {
        connect: imageIds
      }
    });
  }

  const section = await context.prisma.updateSection({
    data: {
      title: title,
      summary: summary,
      gallery: {
        connect: {
          id: galleryObject.id
        }
      },
      showreel,
      type
    },
    where: {
      id: sectionObject.id
    }
  });
  return section;
}

async function createGallerySection(parent, args, context, info) {
  const userId = getUserId(context);
  const {
    gallery,
    title,
    summary,
    showreel,
    type
  } = args.section;
  const {
    images
  } = gallery;
  let imageIds = [];
  const sectionObject = await context.prisma.createSection({
    title: '',
    summary: ''
  });
  await context.prisma.updateUser({
    data: {
      sections: {
        connect: {
          id: sectionObject.id
        }
      }
    },
    where: {
      id: userId
    }
  });
  imageIds = await createImages(images, imageIds, context);
  let galleryObject = sectionObject.gallery ? sectionObject.gallery : null;

  if (galleryObject) {
    await context.prisma.updateGallery({
      images: {
        connect: imageIds
      }
    });
  } else {
    galleryObject = await context.prisma.createGallery({
      images: {
        connect: imageIds
      }
    });
  }

  const section = await context.prisma.updateSection({
    data: {
      title: title,
      summary: summary,
      gallery: {
        connect: {
          id: galleryObject.id
        }
      },
      showreel,
      type
    },
    where: {
      id: sectionObject.id
    }
  });
  return section.id;
}

async function updateSection(parent, args, context, info) {
  const userId = getUserId(context);
  await context.prisma.createNotification({
    user: {
      connect: {
        id: userId
      }
    },
    title: 'Profile Updated!',
    message: "It's good that you did that",
    linkTo: '/app/edit-profile',
    icon: 'contact_mail'
  });
  const sectionExists = await context.prisma.$exists.section({
    id: args.id
  });

  if (sectionExists) {
    const section = await context.prisma.updateSection({
      data: {
        title: args.section.title,
        summary: args.section.summary
      },
      where: {
        id: args.id
      }
    });
    return section;
  } else {
    const {
      title,
      summary
    } = args.section;
    const newSection = await context.prisma.createSection({
      user: {
        connect: {
          id: userId
        }
      },
      title: title,
      summary: summary
    });
    return newSection;
  }
}

module.exports = {
  updateGallerySection,
  createGallerySection,
  updateSection,
  updateTestimonial,
  createTestimonial,
  updateProject,
  createProject
};