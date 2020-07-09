import { Image, ImageTC } from '../models';

const ImageQuery = {
  imageById: ImageTC.getResolver('findById'),
  imageByIds: ImageTC.getResolver('findByIds'),
  imageOne: ImageTC.getResolver('findOne'),
  imageMany: ImageTC.getResolver('findMany'),
  imageCount: ImageTC.getResolver('count'),
  imageConnection: ImageTC.getResolver('connection'),
  imagePagination: ImageTC.getResolver('pagination'),
};

const ImageMutation = {
  imageCreateOne: ImageTC.getResolver('createOne'),
  imageCreateMany: ImageTC.getResolver('createMany'),
  imageUpdateById: ImageTC.getResolver('updateById'),
  imageUpdateOne: ImageTC.getResolver('updateOne'),
  imageUpdateMany: ImageTC.getResolver('updateMany'),
  imageRemoveById: ImageTC.getResolver('removeById'),
  imageRemoveOne: ImageTC.getResolver('removeOne'),
  imageRemoveMany: ImageTC.getResolver('removeMany'),
};

export { ImageQuery, ImageMutation };
