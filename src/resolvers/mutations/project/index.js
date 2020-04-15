const { getUserId } = require('../../../utils');

export async function updateProject(parent, args, context, info) {
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

export async function createProject(parent, args, context, info) {
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
