module.exports = (connection) => {
  const route = require('express').Router();
  const multer = require('multer')
  const multerS3 = require('multer-s3')
  const aws = require('aws-sdk')
  aws.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.AWS_REGION
  });

  const s3 = new aws.S3()

  const upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: "maybe-mall-storage", // 버킷 이름
      contentType: multerS3.AUTO_CONTENT_TYPE, // 자동을 콘텐츠 타입 세팅
      acl: 'private', // 클라이언트에서 자유롭게 가용하기 위함
      key: (req, file, cb) => {
        // cb(null, file.originalname)
        cb(null, Date.now().toString())
      },
    }),
    // limits: { fileSize: 5 * 1024 * 1024 }, // 용량 제한
  });

  route.post('/upload', upload.array("files"), function (req, res, next) {
    const imgFiles = req.files;
    console.log(req.body)
    res.json({
      files: imgFiles,
      message: "파일 업로드 성공",
    })
  })

  return route;
}