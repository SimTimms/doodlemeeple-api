import { ImageTC, Image } from '../models';
import { getUserId } from '../utils';
import aws from 'aws-sdk';

aws.config.update({
  region: 'eu-west-2',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_KEY,
});
const S3_BUCKET = process.env.BUCKET;
var s3 = new aws.S3();

const ImageQuery = {
  imageById: ImageTC.getResolver('findById'),
  imageByIds: ImageTC.getResolver('findByIds'),
  imageOne: ImageTC.getResolver('findOne'),
  imageMany: ImageTC.getResolver('findMany'),
  imageCount: ImageTC.getResolver('count'),
  imageConnection: ImageTC.getResolver('connection'),
  imagePagination: ImageTC.getResolver('pagination'),
  imageCategory: ImageTC.getResolver('imageCategory'),
  profileImages: ImageTC.getResolver('profileImages'),
};

const ImageMutation = {
  imageCreateOne: ImageTC.getResolver('createOne').wrapResolve(
    (next) => async (rp) => {
      const userId = getUserId(rp.context.headers.authorization);
      rp.args.record.user = userId;

      const image = await next(rp);
      return image;
    }
  ),
  imageCreateMany: ImageTC.getResolver('createMany'),
  imageUpdateById: ImageTC.getResolver('updateById'),
  imageUpdateOne: ImageTC.getResolver('updateOne'),
  imageUpdateMany: ImageTC.getResolver('updateMany'),
  imageRemoveById: ImageTC.getResolver('removeById').wrapResolve(
    (next) => async (rp) => {
      const userId = getUserId(rp.context.headers.authorization);
      const image = await Image.findOne({
        _id: rp.args._id,
        user: { _id: userId },
      });

      const params = {
        Bucket: S3_BUCKET,
        Key: image.img.replace('https://dm-uploads-uk.s3.amazonaws.com/', ''),
      };
      await s3.deleteObject(params, function (err, data) {});

      return next(rp);
    }
  ),
  imageRemoveOne: ImageTC.getResolver('removeOne'),
  imageRemoveMany: ImageTC.getResolver('removeMany'),
  categoriseImages: ImageTC.getResolver('categoriseImages'),
};

export { ImageQuery, ImageMutation };
