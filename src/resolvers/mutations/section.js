const { getUserId } = require('../../utils');
const { UPDATED_PROFILE } = require('../../utils/notifications');
const {
  createImages,
  createNotification,
  notableProjectsCreator,
  testimonialsCreator
} = require('./utils');

async function updateProject(parent, args, context, info) {
  const userId = getUserId(context);
  const { project, sectionId } = args;
  const projectExists = await context.prisma.$exists.notableProjects({
    id: project.id
  });
  let setProjectId = '';
  let setSectionId = '';

  if (projectExists) {
    await context.prisma.updateNotableProjects({
      data: {
        name: project.name,
        summary: project.summary,
        image: project.image
      },
      where: {
        id: project.id
      }
    });

    setProjectId = project.id;
    setSectionId = sectionId;
  } else {
    const sectionExists = await context.prisma.$exists.section({
      id: sectionId
    });

    const sectionObject = !sectionExists
      ? await context.prisma.createSection({
          user: { connect: { id: userId } },
          title: '',
          summary: '',
          notableProjects: []
        })
      : await context.prisma.section({
          id: args.sectionId
        });

    const projectReturn = await context.prisma.createNotableProjects({
      name: project.name,
      summary: project.summary,
      image: project.image
    });

    setProjectId = projectReturn.id;
    setSectionId = sectionObject.id;
  }

  await context.prisma.updateSection({
    data: {
      notableProjects: { connect: [{ id: setProjectId }] }
    },
    where: {
      id: setSectionId
    }
  });

  return project.id;
}

async function createProject(parent, args, context, info) {
  const userId = getUserId(context);
  const { project, sectionId } = args;

  let setProjectId = '';
  let setSectionId = '';

  const sectionExists = await context.prisma.$exists.section({
    id: sectionId
  });

  const sectionObject = !sectionExists
    ? await context.prisma.createSection({
        user: { connect: { id: userId } },
        title: '',
        summary: '',
        notableProjects: []
      })
    : await context.prisma.section({
        id: args.sectionId
      });

  const projectReturn = await context.prisma.createNotableProjects({
    name: project.name,
    summary: project.summary,
    image: project.image
  });

  setProjectId = projectReturn.id;
  setSectionId = sectionObject.id;

  await context.prisma.updateSection({
    data: {
      notableProjects: { connect: [{ id: setProjectId }] }
    },
    where: {
      id: setSectionId
    }
  });

  return setProjectId;
}

async function updateTestimonial(parent, args, context, info) {
  const userId = getUserId(context);
  const { testimonial, sectionId } = args;
  const testimonialExists = await context.prisma.$exists.testimonial({
    id: testimonial.id
  });
  let setTestimonialId = '';
  let setSectionId = '';

  if (testimonialExists) {
    await context.prisma.updateTestimonial({
      data: {
        name: testimonial.name,
        summary: testimonial.summary,
        image: testimonial.image
      },
      where: {
        id: testimonial.id
      }
    });

    setTestimonialId = testimonial.id;
    setSectionId = sectionId;
  } else {
    const sectionExists = await context.prisma.$exists.section({
      id: sectionId
    });

    const sectionObject = !sectionExists
      ? await context.prisma.createSection({
          user: { connect: { id: userId } },
          title: '',
          summary: '',
          testimonialtestimonials: []
        })
      : await context.prisma.section({
          id: args.sectionId
        });

    const testimonialReturn = await context.prisma.createTestimonial({
      name: testimonial.name,
      summary: testimonial.summary,
      image: testimonial.image
    });

    setTestimonialId = testimonialReturn.id;
    setSectionId = sectionObject.id;
  }

  await context.prisma.updateSection({
    data: {
      testimonials: { connect: [{ id: setTestimonialId }] }
    },
    where: {
      id: setSectionId
    }
  });

  return testimonial;
}

async function updateGallerySection(parent, args, context, info) {
  console.log(args.section);
  const userId = getUserId(context);
  const {
    gallery,
    title,
    summary,
    notableProjects,
    testimonials,
    showreel,
    type
  } = args.section;
  const sectionExists = await context.prisma.$exists.section({
    id: args.id
  });
  const { images } = gallery;
  let imageIds = [];
  let testimonialIds = [];
  let notableIds = [];

  createNotification(UPDATED_PROFILE, userId, context);

  const sectionObject = !sectionExists
    ? await context.prisma.createSection({
        user: { connect: { id: userId } },
        title: '',
        summary: ''
      })
    : await context.prisma.section({
        id: args.id
      });

  imageIds = await createImages(images, imageIds, context);

  let galleryObject = sectionObject.gallery ? sectionObject.gallery : null;

  if (galleryObject) {
    await context.prisma.updateGallery({
      images: { connect: imageIds }
    });
  } else {
    galleryObject = await context.prisma.createGallery({
      images: { connect: imageIds }
    });
  }
  //TODO: make this less resource demanding, we only need to update projects that have changed or create new ones

  notableIds = await notableProjectsCreator(
    notableIds,
    notableProjects,
    context
  );

  testimonialIds = await testimonialsCreator(
    testimonialIds,
    testimonials,
    context
  );

  const section = await context.prisma.updateSection({
    data: {
      title: title,
      summary: summary,
      gallery: { connect: { id: galleryObject.id } },
      testimonials: { connect: testimonialIds.map(id => id) },
      notableProjects: { connect: notableIds.map(id => id) },
      showreel,
      type
    },
    where: {
      id: sectionObject.id
    }
  });

  return section;
}

async function updateSection(parent, args, context, info) {
  const userId = getUserId(context);

  await context.prisma.createNotification({
    user: { connect: { id: userId } },
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
    const { title, summary } = args.section;

    const newSection = await context.prisma.createSection({
      user: { connect: { id: userId } },
      title: title,
      summary: summary
    });

    return newSection;
  }
}

module.exports = {
  updateGallerySection,
  updateSection,
  updateTestimonial,
  updateProject,
  createProject
};
