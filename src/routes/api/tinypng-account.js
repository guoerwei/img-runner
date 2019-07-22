"use strict";

const Router = require("koa-router");

const redis = require("../../redis");
const inputValidation = require("../../middlewares/input-validation");
const { ResourceNotFoundError } = require("../../custom-errors/check-errors");

const TinypngAccountModel = require("../../db/TinypngAccountModel");
const { getInstance } = require("../../services/tinypng-instance");
const { forceUpdateRemain } = require("../../services/tinypng-account");

const router = new Router();

/**
 * 查询tinypng的账号列表
 */
router.get("/", async ctx => {
  const list = await TinypngAccountModel.findAll({ raw: true });
  const remains = await Promise.all(
    list.map(v => redis.get(`TINYPNG_REMAIN_${v.key}`))
  );
  const listWithRemain = list.map((v, k) => {
    const parseRemain = parseInt(remains[k], 10);
    const remain = parseRemain < 0 ? 0 : parseRemain;
    return {
      ...v,
      remain
    };
  });
  ctx.apiResponse({ list: listWithRemain });
});

/**
 * 添加一个新的tinypng账号
 */
router.post(
  "/",
  inputValidation("/api/tinypng-account/create.json"),
  async ctx => {
    await getInstance(ctx.input.body.key);
    await TinypngAccountModel.create({
      name: ctx.input.body.name,
      key: ctx.input.body.key,
      monthlyLimit: ctx.input.body.monthlyLimit
    });
    await forceUpdateRemain();
    ctx.apiResponse();
  }
);

/**
 * 修改一个tinypng的账号
 */
router.put(
  "/:id(\\d+)",
  inputValidation("/api/tinypng-account/update.json"),
  async ctx => {
    const tinypngAccount = await TinypngAccountModel.findByPk(
      ctx.input.params.id
    );
    if (!tinypngAccount) {
      throw new ResourceNotFoundError("tinypng账号不存在");
    }
    await getInstance(ctx.input.body.key);
    tinypngAccount.name = ctx.input.body.name;
    tinypngAccount.key = ctx.input.body.key;
    tinypngAccount.monthlyLimit = ctx.input.body.monthlyLimit;
    await tinypngAccount.save();
    await forceUpdateRemain();
    ctx.apiResponse();
  }
);

/**
 * 删除一个tinypng的账号
 */
router.delete(
  "/:id(\\d+)",
  inputValidation("/api/tinypng-account/delete.json"),
  async ctx => {
    const tinypngAccount = await TinypngAccountModel.findByPk(
      ctx.input.params.id
    );
    if (!tinypngAccount) {
      throw new ResourceNotFoundError("tinypng账号不存在");
    }
    await tinypngAccount.destroy();
    await forceUpdateRemain();
    ctx.apiResponse();
  }
);

router.post("/sync", async ctx => {
  await forceUpdateRemain();
  ctx.apiResponse();
});

router.get("/remain", async ctx => {
  const remainTotal = await redis.get("TINYPNG_REMAIN");
  const list = await TinypngAccountModel.findAll({ raw: true });

  const remainList = (await Promise.all(
    list.map(v => redis.get(`TINYPNG_REMAIN_${v.key}`))
  )).map((v, k) => ({
    key: list[k].key,
    remain: v
  }));

  ctx.apiResponse({ remainTotal, remainList });
});

module.exports = router;
