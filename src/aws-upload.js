var aws = require('aws-sdk');
require('dotenv').config();

exports.sign_s3 = async (req, res) => {
  if (!req.body.fileName) {
    return res.send('No File Submitted');
  }

  if (
    !process.env.BUCKET ||
    !process.env.AWS_SECRET_KEY ||
    !process.env.AWS_ACCESS_KEY_ID
  ) {
    console.log('AWS Env Vars Missing');
  }

  const s3 = new aws.S3({ signatureVersion: 'v4' });

  aws.config.update({
    region: 'eu-west-2', // Put your aws region here
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  });

  const S3_BUCKET = process.env.BUCKET;

  if (!req.body.fileName) {
    return res.send('No File Submitted');
  }

  const fileName = req.body.fileName;
  const fileType = req.body.fileType;
  const fileSize = req.body.fileSize;

  const approvedFileTypes = ['png', 'jpg', 'jpeg'];
  const approvedFileSize = 2500000;

  if (approvedFileTypes.indexOf(fileType.toLowerCase()) === -1) {
    res.json({ success: false, error: 'invalid image' });
    return;
  }
  if (fileSize > approvedFileSize) {
    res.json({
      success: false,
      error: `image must be smaller than ${approvedFileSize}`,
    });
    return;
  }
  const s3Params = {
    Bucket: S3_BUCKET,
    Key: `${fileName}`,
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
      url: `https://${S3_BUCKET}.s3.amazonaws.com/${fileName}`,
    };

    res.json({ success: true, data: { returnData } });
  });
};
