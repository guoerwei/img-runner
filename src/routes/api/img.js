"use strict";

const Router = require("koa-router");
const { Op } = require("sequelize");

const inputValidation = require("../../middlewares/input-validation");

const { getInstance } = require("../../oss-clients");
const ImageModel = require("../../db/ImageModel");

const router = new Router();

router.get("/", inputValidation("/api/img/list.json"), async ctx => {
  // 获取图片列表
  const where = {};
  if (ctx.input.query.last) {
    where.where = {
      id: {
        [Op.lt]: ctx.input.query.last
      }
    };
  }
  const ossInstance = getInstance();
  const list = (await ImageModel.findAll({
    raw: true,
    attributes: {
      exclude: ["compressFlow", "compressDate", "config", "compressRes"]
    },
    ...where,
    limit: ctx.input.query.limit,
    order: [["id", "DESC"]]
  })).map(v => ({
    ...v,
    path: `${ossInstance.ossConfig.host}/${ossInstance.ossConfig.path}`
  }));
  ctx.apiResponse(list);
});

router.get("/status", inputValidation("/api/img/status.json"), async ctx => {
  const ossInstance = getInstance();
  const list = (await ImageModel.findAll({
    raw: true,
    attributes: {
      exclude: ["compressFlow", "compressDate", "config", "compressRes"]
    },
    where: {
      id: ctx.input.query.imageIds
    },
    order: [["id", "DESC"]]
  })).map(v => ({
    ...v,
    path: `${ossInstance.ossConfig.host}/${ossInstance.ossConfig.path}`
  }));
  ctx.apiResponse(list);
});

module.exports = router;
