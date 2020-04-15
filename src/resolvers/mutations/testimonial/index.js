const { getUserId } = require('../../../utils');

export async function updateTestimonial(parent, args, context, info) {
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

export async function createTestimonial(parent, args, context, info) {
  const userId = getUserId(context);
  const { testimonial, sectionId } = args;

  let setTestimonialId = '';
  let setSectionId = '';

  const sectionExists = await context.prisma.$exists.section({
    id: sectionId
  });

  const sectionObject = !sectionExists
    ? await context.prisma.createSection({
        user: { connect: { id: userId } },
        title: '',
        summary: '',
        testimonials: []
      })
    : await context.prisma.section({
        id: args.sectionId
      });

  const returnObj = await context.prisma.createTestimonial({
    name: testimonial.name,
    summary: testimonial.summary,
    image: testimonial.image
  });

  setTestimonialId = returnObj.id;
  setSectionId = sectionObject.id;

  await context.prisma.updateSection({
    data: {
      testimonials: { connect: [{ id: setTestimonialId }] }
    },
    where: {
      id: setSectionId
    }
  });

  return setTestimonialId;
}
