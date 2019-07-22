"use strict";

const crypto = require("crypto");
const Router = require("koa-router");
const imageSize = require("image-size");

const inputValidation = require("../../middlewares/input-validation");

const ImageModel = require("../../db/ImageModel");
const { readFile, writeFile, unlink } = require("../../utils/fs-helper");
const { getToCompressFilePath } = require("../../utils/path-helper");

const router = new Router();

/**
 * 上传文件
 */
router.post("/", inputValidation("/api/upload/upload.json"), async ctx => {
  const randName = crypto.randomBytes(16).toString("hex");
  const buf = await readFile(ctx.input.files.file.path);
  const size = imageSize(buf);
  const fileName = `${randName}.${size.type}`;
  const toCompressPath = getToCompressFilePath(fileName);
  const res = await ImageModel.create({
    name: fileName,
    extname: size.type,
    width: size.width,
    height: size.height,
    status: 1,
    originSize: buf.length,
    config: ctx.input.body.config
  });
  await writeFile(toCompressPath, buf);
  ctx.apiResponse({
    id: res.id,
    name: fileName
  });
  unlink(ctx.input.files.file.path).then(() => {});
});

/**
 * 上传后轮询上传状态
 */
// router.get(
//   "/query-status",
//   inputValidation("/api/upload/query-status.json"),
//   async ctx => {
//     const list = await ImageModel.findAll({
//       attributes: [
//         "id",
//         "name",
//         "extname",
//         "size",
//         "width",
//         "height",
//         "status",
//         "cover",
//         "thumb",
//         "originSize",
//         "compressRetry",
//         "compressMsg",
//         "compressDate",
//         "compressRes",
//         "uploadRetry",
//         "uploadMsg",
//         "completeDate"
//       ],
//       where: {
//         id: ctx.input.query.imageIds
//       }
//     });
//     ctx.apiResponse({ list });
//   }
// );

module.exports = router;
