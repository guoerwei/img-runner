"use strict";

const path = require("path");
const fs = require("fs");

const Koa = require("koa");
const Router = require("koa-router");
const koaQs = require("koa-qs");
const koaSend = require("koa-send");
const pug = require("pug");

const app = koaQs(new Koa()); // 对query可以更好地解析
const router = new Router();
const { compressTaskConfig, uploadTaskConfig } = require("../config");
const compressTask = require("../services/compress-task");
const uploadTask = require("../services/upload-task");
const { readFile } = require("../utils/fs-helper");

const apiRouter = require("../routes/api");

(async () => {
  await require("../db").authenticate();

  // 跑定时脚本
  const runCompressTick = () => {
    compressTask.runTick().finally();
  };
  const runUploadTick = () => {
    uploadTask.runTick().finally();
  };
  runCompressTick();
  runUploadTick();
  setInterval(runCompressTick, compressTaskConfig.tickTime);
  setInterval(runUploadTick, uploadTaskConfig.tickTime);

  router.use("/api", apiRouter.routes(), apiRouter.allowedMethods());

  router.use("/static", async ctx => {
    const filePath = path.resolve(__dirname, "../../", ctx.path);
    await koaSend(ctx, filePath);
  });

  router.get("*", async ctx => {
    const templatePath = path.resolve(__dirname, "../templates/index.pug");
    const html = pug.renderFile(templatePath, {
      staticPath: require("../config").pageConfig.path
    });
    ctx.body = html;
  });

  app.use(router.routes());
  app.use(router.allowedMethods());
  app.listen(80);
})();
