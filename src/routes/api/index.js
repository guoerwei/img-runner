"use strict";

const Router = require("koa-router");
const koaBody = require("koa-body");

const apiResponse = require("../../middlewares/api-response");
const inputTransfer = require("../../middlewares/input-transfer");

const tinypngAccountRouter = require("./tinypng-account");
const albumRouter = require("./album");
const uploadRouter = require("./upload");
const imgRouter = require("./img");

const router = new Router();

router.use(apiResponse());
router.use(
  koaBody({
    multipart: true,
    formidable: {
      multiples: false, // 一次一个文件
      maxFieldsSize: 5242880 // 5m
    }
  })
);

router.use(inputTransfer());
router.use(
  "/tinypng-account",
  tinypngAccountRouter.routes(),
  tinypngAccountRouter.allowedMethods()
);
router.use("/album", albumRouter.routes(), albumRouter.allowedMethods());
router.use("/upload", uploadRouter.routes(), uploadRouter.allowedMethods());
router.use("/img", imgRouter.routes(), imgRouter.allowedMethods());

module.exports = router;
