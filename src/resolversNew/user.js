import { signupChecks } from '../utils';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
  User,
  Section,
  Gallery,
  Image,
  NotableProject,
  Testimonial,
} from '../models';
const { emailSignup } = require('../email');

export async function userMigrate(args) {
  const {
    password,
    email,
    username,
    profileImg,
    profileBG,
    summary,
    sections,
    images,
    notableProjects,
    showreel,
    testimonials,
  } = args;

  const newUser = await User.create({
    password,
    name: username,
    email,
    profileImg,
    profileBG,
    summary,
  });

  let newSection;

  var sectionIds = sections.map(async (section) => {
    const newGallery = await Gallery.create({});

    var imageIds = images.map(async (image) => {
      if (image.gallery === section.gallery) {
        const newImage = await Image.create({
          img: image.img,
          gallery: newGallery._id,
          user: newUser._id,
        });
        return newImage._id;
      }
    });

    Promise.all(imageIds).then(function (results) {});

    var notableProjectIds = notableProjects.map(async (project) => {
      for (let i = 0; i < section.notableProjects.length; i++) {
        if (section.notableProjects[i] === project._id) {
          return await NotableProject.create({
            name: project.name,
            summary: project.summary,
            image: project.image,
          });
        }
      }
    });

    await Promise.all(notableProjectIds).then(async function (results) {
      newSection = await Section.create({
        summary: section.summary,
        showreel: section.showreel,
        gallery: newGallery._id,
        notableProjects: results.filter((item) => item),
        user: newUser._id,
      });

      await NotableProject.updateMany(
        { _id: { $in: results.filter((item) => item) } },
        { section: newSection._id }
      );
      return newSection._id;
    });

    var testimonialIds = testimonials.map(async (testimonial) => {
      for (let i = 0; i < section.testimonials.length; i++) {
        if (section.testimonials[i] === testimonial._id) {
          return await Testimonial.create({
            name: testimonial.name,
            summary: testimonial.summary,
            image: testimonial.image,
          });
        }
      }
    });

    return Promise.all(testimonialIds).then(async function (results) {
      await Testimonial.updateMany(
        { _id: { $in: results.filter((item) => item) } },
        { section: newSection._id }
      );

      const updateSection = Section.updateOne(
        { _id: newSection._id },
        { testimonials: results.filter((item) => item) }
      );
      return newSection._id;
    });
  });

  Promise.all(sectionIds).then(async function (results) {
    const updatedUser = await User.updateOne(
      { _id: newUser._id },
      {
        sections: results,
      }
    );
    return updatedUser;
  });
}

export async function userRegistration(rp) {
  const { password, email, name } = rp.args.record;
  const validSubmission = signupChecks({
    password,
    name,
    email,
  });

  if (validSubmission === false) {
    throw new Error('Submission Failed');
  }
  const passwordEncrypted = await bcrypt.hash(password, 10);
  rp.args.record.password = passwordEncrypted;

  const request = emailSignup(email, name);
  request
    .then((result) => {})
    .catch((err) => {
      console.log(err.statusCode);
    });

  return rp;
}

export async function login(args) {
  const user = await User.findOne(
    {
      email: args.email,
    },
    { email: 1, password: 1, token: 1 }
  );

  if (!user) {
    throw new Error('No such user found');
  }

  const valid = await bcrypt.compare(args.password, user.password);
  if (!valid) {
    throw new Error('Invalid password');
  }
  const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
  user.token = token;
  return user;
}
