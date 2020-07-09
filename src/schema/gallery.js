import { GalleryTC } from '../models';

const GalleryQuery = {
  galleryById: GalleryTC.getResolver('findById'),
  galleryByIds: GalleryTC.getResolver('findByIds'),
  galleryOne: GalleryTC.getResolver('findOne'),
  galleryMany: GalleryTC.getResolver('findMany'),
  galleryCount: GalleryTC.getResolver('count'),
  galleryConnection: GalleryTC.getResolver('connection'),
  galleryPagination: GalleryTC.getResolver('pagination'),
};

const GalleryMutation = {
  galleryCreateOne: GalleryTC.getResolver('createOne'),
  galleryCreateMany: GalleryTC.getResolver('createMany'),
  galleryUpdateById: GalleryTC.getResolver('updateById'),
  galleryUpdateOne: GalleryTC.getResolver('updateOne'),
  galleryUpdateMany: GalleryTC.getResolver('updateMany'),
  galleryRemoveById: GalleryTC.getResolver('removeById'),
  galleryRemoveOne: GalleryTC.getResolver('removeOne'),
  galleryRemoveMany: GalleryTC.getResolver('removeMany'),
};

export { GalleryQuery, GalleryMutation };
