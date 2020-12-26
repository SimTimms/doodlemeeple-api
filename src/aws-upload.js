var aws = require('aws-sdk');
require('dotenv').config();
const { getUserIdWithoutContext } = require('./utils');
const filenamify = require('filenamify');

exports.sign_s3 = async (req, res) => {
  if (!req.body.fileName) {
    return res.send('No File Submitted');
  }

  const userId = getUserIdWithoutContext(req.body.headers.Authorization);

  if (
    !process.env.BUCKET ||
    !process.env.AWS_SECRET_KEY ||
    !process.env.AWS_ACCESS_KEY_ID
  ) {
    console.log('AWS Env Vars Missing');
  }
  aws.config.update({
    region: 'eu-west-2',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  });

  const s3 = new aws.S3({ signatureVersion: 'v4' });

  const S3_BUCKET = process.env.BUCKET;

  if (!req.body.fileName) {
    return res.send('No File Submitted');
  }
  let fileName = filenamify(req.body.fileName, { maxLength: 10 });
  fileName = `${userId}/${fileName}-${userId}-${new Date().getTime()}`;
  const fileType = req.body.fileType;
  const fileSize = req.body.fileSize;

  const approvedFileTypes = [
    'png',
    'jpg',
    'jpeg',
    'JPG',
    'JPEG',
    'PNG',
    'gif',
    'GIF',
  ];
  const approvedFileSize = 2000000;

  if (approvedFileTypes.indexOf(fileType.toLowerCase()) === -1) {
    res.json({ success: false, error: 'PNG, GIF or JPG only' });

    return;
  }
  if (fileSize > approvedFileSize) {
    res.json({
      success: false,
      error: `${approvedFileSize / 2000000} MB`,
    });

    return;
  }

  const s3Params = {
    Bucket: S3_BUCKET,
    Key: `${fileName}.${fileType}`,
    ContentType: fileType,
    ACL: 'public-read',
  };
  await s3.getSignedUrl('putObject', s3Params, (err, data) => {
    if (err) {
      res.json({ success: false, error: err });
      return;
    }

    const returnData = {
      signedRequest: data,
      url: `https://${S3_BUCKET}.s3.amazonaws.com/${fileName}.${fileType}`,
    };

    res.json({ success: true, data: { returnData } });
  });
};
